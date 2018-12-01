/***
  - defines a parser generator that inplements the pratt
  parser algorythm
  - usage:
    var pratt = require("pratt/parser")
    var g = peg.grammar()
    var r = pratt.create(g("expr"))
    r.assign(
      r.left(10, "+", r.as("v2")),
      r.left(10, "-", r.as("v2")),
      r.left(20, "*", r.as("v2")),
      r.left(20, "/", r.as("v2")),
      r.right(30, "^", r.as("v2")),
      r.unary(g("string")),
      r.unary(g("number")),
      r.unary("(", g("expr"), ")")
    )

  - api:
    - create: creates a pratt parser using the specified rule as target
      (the rule's body will call the pratt parser)

    - assign: defines the rule's body. it must be a list of 'expressions' created
      using the returned object from 'create'

    - left: returns a left-associative expression at the supplied precedence;
        any references to r inside this rule (r.ref or r.as(...)) will create
        a call to r passign the specified precedence as parameter;

    - right: returns a right-associative expression at the supplied precedence;
      any references to r inside this rule (r.ref or r.as(...)) will create
      a call to r passing the specified precedence as parameter;

    - unary: returns an unary expression that has a higher precedence than
      left or right alternatives;

    - as: defines a capture group for the expression or reference


**/
define(["peg/matcher", "peg/rule"],
function(Matcher, Rule){

  var ASSOC_LEFT = 1
  var ASSOC_RIGHT = 2

  class ExprMatcher extends Matcher{
    constructor(rule, primaries, secondaries){
      super()
      this.rule = rule
      this.primaries = primaries || []
      this.secondaries = secondaries || []
    }

    match(ctx){
      var self = this
      var prec = ctx.popVar("prec") || 0
      var error
      var found = false
      for(var m of self.primaries){
        var c2 = m.match(ctx.clone());
        if(c2.accepted){
          found = true
          ctx = c2
          break;
        }
        if(!error || error.position < c2.position){
          error = c2
        }
      } //for

      if(!found) return error || ctx.fail()

      while(found){
        found = false
        for(var m of self.secondaries){
          if(prec < (m.prec || 0 ){
            var c2 = m.match(ctx.clone())
            if(c2.accepted){
              found = true;
              ctx = c2;
              break;
            } //if(c2...)
          } //if(prec...)
        }//for m
      } //while

      return ctx;

    } //evalExpr
  } //ExprMatcher

  class ExprCaller extends Matcher {
    constructor(rule, prec, assoc, ...steps){
      super()
      this.rule = rule
      this.prec = prec
      this.assoc = assoc
      this.name = ""
      this.list = []
      for(var m of steps) this.value.push(Matcher.from(m))
    }

    match(ctx){
      var self = this
      var p = ctx.setVar("prec")
      var n = p.top
      var prec = self.assoc === ASSOC_LEFT
          ? self.prec
          : self.prec -1
      for(var m of self.list){
        p.push(prec)
        ctx = m.match(ctx)
        p.top = n
        if(ctx.failed) break
      }
      return ctx
    }

  }

  class ExprBuilder {
    constructor(rule){
      if(!(rule instanceof Rule)) throw new Error("Invalid rule")
      this.rule = rule;
      this.matcher = new ExprMatcher(rule)
      rule.assign(this.matcher)
    }

    assign(...exprs){
      for(var m of exprs){
        if(!m.prec || m.rule !== this.rule){
          this.matcher.primaries.push(m)
        } else {
          this.matcher.secondaries.push(m)
        }
      }
    }

    left(prec, ...steps){
      return new ExprCaller(this.rule, ~~prec, ASSOC_LEFT, ...steps)
    }

    right(prec, ...steps){
      return new ExprCaller(this.rule, ~~prec, ASSOC_RIGHT, ...steps)
    }

    unary(value){
      return Matcher.from(value)
    }

  }

  ExprBuilder.create = function(rule){
    return new ExprBuilder(rule)
  }
})
