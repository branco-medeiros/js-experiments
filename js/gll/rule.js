define(["gll/code-builder", "gll/op-kind", "types/list", "peg/matcher", "peg/rule", "utils/quote"],
function(Builder, Kind, List, Matcher, PegRule, quote){

  var create = Builder

  function kind2str(k){
    switch(k){
      case Kind.CALL: return "CALL"
      case Kind.SPLIT: return "SPLIT"
      case Kind.RET: return "RET"
      case Kind.GOTO: return "GOTO"
      case Kind.MATCH: return "MATCH"
      case Kind.SUCCEED: return "SUCCEED"
      case Kind.FAIL: return "FAIL"
      case Kind.FN: return "FN"
      default: return "UNKNOWN(" + k + ")"
    }
  }

  function display(instr){
    if(!instr) return "<NULL>"
    switch(instr.kind){
      case Kind.CALL: return "CALL " + ((instr.rule && instr.rule.name) || "(unknown rule)")
      case Kind.FN: return "FN <" + instr.fn.name + ">"
      case Kind.GOTO: return "GOTO " + instr.position
      case Kind.SPLIT: return "SPLIT " + instr.position
      case Kind.MATCH: return "MATCH " + (
        instr.value instanceof Function
        ? ("<" + (instr.value.name || "...") + ">")
        : quote(instr.value, "'")
      )
      default:
        return kind2str(instr.kind)
    }
  }



  class Rule {

    constructor(name){
      this.name = name
      this.source = new List([])
    }

    get source(){
      return this._source
    }

    set source(value){
      if(value instanceof List){
        this._source = value.clone()
      } else if(value instanceof Array){
        this._source = new List(value)

      } else if(source == null){
        this._source = new List([])

      } else if(source instanceof Frame){
        this._source = new List([value])

      } else {
        throw new Error("Invalid source")
      }
    }

    get valid(){
      return this.source.length
    }

    get grammar(){
      return this._grammar
    }

    set grammar(g){
      if((g != null) && g.get(this.name) !== this) throw new Error("Invalid grammar")
      this._grammar = g;
    }

    assign(v){
      if(!(v instanceof Matcher)) throw new Error("Invalid assignment");
      this.source = []
      this.compile(v instanceof PegRule? v._matcher: v)
      create.ret(this.source)
      return this
    }

    compile(v){
      if(v == null) throw new Error("Invalid value")

      if(v instanceof Matcher){
        if(v instanceof Matcher.Seq){
          return this.seq(...v.list)

        } else if(v instanceof Matcher.Alt){
          return this.alt(...v.list)

        } else if(v instanceof Matcher.Rep){
          return this.rep(v.min, v.max, v.value)

        } else if(v instanceof Matcher.Lit){
          return this.lit(v.value)

        } else if(v instanceof Matcher.Any){
          return this.any()

        } else if(v instanceof Matcher.OneOf){
          return this.oneof(v.value)

        } else if(v instanceof Matcher.Capture){
          return this.capture(v.id, v.value)

        } else if(v instanceof Matcher.Is){
          return this.is(v.value)

        } else if(v instanceof Matcher.IsNot){
          return this.isnt(v.value)

        } else if(v instanceof PegRule){
          var rule = this.grammar.get(v.name);
          if(!rule.valid) rule.assign(v)
          return this.call(rule)

        } else {
          throw new Error("Unsupported Matcher: " + v)
        }
      }

      if(v instanceof Rule) return this.call(v)
      if(v instanceof Array) return this.seq(v)
      return this.lit(v)
    }

    call(rule){
      create.call(this.source, rule)
      return this
    }

    alt(...seq){
      var self = this
      var jumps = []
      var last = seq.length - 1
      seq.forEach(function(v, i){
        if(i < last){
          create.split(self.source, 0);
          var fixup = self.last
        }
        self.compile(v)
        if(i < last){
          create.goto(self.source, 0)
          jumps.push(self.last)
          fixup.position = self.length
        }
      })
      var max = self.length
      jumps.forEach((v) => v.position = max)
      return self
    }

    seq(...args){
      var self = this
      for(var op of args){
        self.compile(op)
      }
      return self
    }

    lit(v){
      create.match(this.source, v)
      return this
    }

    opt(v){
      create.split(this.source, 0)
      var target = this.last
      this.compile(v)
      target.position = this.length
      return this
    }

    star(v){
      var top = this.length
      create.split(this.source, 0)
      var target = this.last
      this.compile(v)
      create.goto(this.source, top)
      target.position = this.length
      return this
    }

    plus(v){
      return this.compile(v).star(v)
    }

    rep(min, max, v){
      var self = this
      if(!min && !max) return self.star(v)
      if(!min && max === 1) return self.opt(v)
      if(min === 1 && !max) return self.plus(v)

      //artificial limits since we didnt setup a context
      //so we can simply loop for a predetermined number of times
      if(min > 10 || max > 10 || min > max) throw new Error("Invalid min/max parameters")

      for(var i = 0; i < min; ++i) self.compile(v)

      var jumps = []
      for(var i= min; i < max; ++i) {
        create.split(self.source, 0)
        jumps.push(self.last)
        this.compile(v)
        create.goto(self.source, 0)
        jumps.push(self.last)
      }
      var max = self.length
      jumps.forEach((v) => v.position = max)
      return self
    }

    any(){
      return this.lit(function any(v){
        return true
      })
    }

    oneof(list){
      return this.lit(function oneof(v){
        list.indexOf(v) >= 0
      })
    }

    str(list){
      return this.seq(...list.split(""))
    }

    eof(){
      return this.fn(function(thread){
        return thread.input.finished
      })
    }

    fn(fn){
      create.fn(this.source, fn)
      return this;
    }

    capture(id, value){
      //TODO: implement start/end capture
      create.fn(this.source, function StartCapture(v){})
      this.compile(value)
      create.fn(this.source, function EndCapture(v){})
    }

    is(value){
      //TODO: implement is as a separate parser
      create.fn(this.source, function StartIsTest(v){})
      this.compile(value)
      create.fn(this.source, function EndIsTest(v){})
    }

    isnt(value){
      //TODO: implement isnt as a separate parser
      create.fn(this.source, function StartIsNotTest(v){})
      this.compile(value)
      create.fn(this.source, function EndIsNotTest(v){})
    }

    display(){
      return this.name
    }

    fullDisplay(){
      var result = ["RULE " + this.name]
      this.source.forEach(function(v, i){
        result.push(
          "  " +
          (i < 1000?("000" + i).substr(-4): ("" + i)) +
          "    " +
          display(v)
        )
      })

      return result.join("\r\n")
    }

    static create(name){
      return new Rule(name)
    }

  }

  Rule.types = {
    Matcher: Matcher,
    PegRule: PegRule,
    List: List
  }

  return Rule

})
