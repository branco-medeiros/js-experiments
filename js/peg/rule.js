define(["peg/matcher"],
function(Matcher){

  var PREC_ALT = 10

  function noop(){}
  var emptyList = []

	class Rule extends Matcher.ListMatcher{

		constructor(name, body){
      var list = body == null? []
        : (body instanceof Array? body
          : (body instanceof Matcher.Alt? body.list
            : [body]))
			super(emptyList)
			this.name = name;
      this.body = body
      this.isRule = true
		}

    get body(){
      return this.list
    }

    set body(value){
      this.list = value == null? []
        : (value instanceof Array? value.map((v) => Matcher.from(v))
          : (value.isAlt? value.list.slice(0)
            : [Matcher.from(value)]))
    }

    match_test00(ctx, ...args){
      var result = ctx.pushRule(this)
      var fail, ok = false, ret = ctx
      for(var m of this.list){
        ret = m.match(ctx.clone(), ...args)
        if(!ret.failed){
          ok = true
          break
        }
        fail = (fail && fail.position < ret.position) || ret
      }
      ctx = ok? ret : (fail || ctx.fail())
      result.end = ctx.position
      ctx.popAsChild(ok)
      return ctx
    }

		match_test01(ctx, prec, ...args){
      var pos = ctx.position
      var r = ctx.result.find((v) => v.rule === this && v.position === pos)
      if(r){
        if(!r.recursing){
          r.recursed = true
          return ctx.fail()
        }

        ctx.children.push(r.lastValue)
        ctx.position = r.lastValue.end
        return ctx
      }
      var result = ctx.pushRule(this)
      var fail, alts = [], ok = false, ret = ctx
      for(var m of this.list){
        result.recursed = false
        ret = m.match(ctx.clone(), ...args)
        if(!ret.failed){
          ok = true
          break
        }
        if(result.recursed) alts.push(m)
        fail = (fail && fail.position < ret.position) || ret
      }
      ctx = ok? ret : (fail || ctx.fail())
      result.position = ctx.position
      if(ok && alts.length){
        while(!ret.failed){
          ctx = ret
          ctx.position = result.start
          for(var m of alts){
            var cur = ctx.swapRule(this)
            cur.recursing = true
            cur.lastValue = result
            ret = m.match(ctx.clone(), ...args)
            if(!ret.failed){
              result = cur
              result.end = ret.position
              break
            }
          }
        }
        ctx.swap(result)
      }
      ctx.popAsChild(ok)
      return ctx
		}

    match(ctx, prec, ...args){
      if(prec && prec.rule === this){
        //prec is actually the parameter
        //for this rule
        ctx.children.push(prec)
        ctx.position = prec.end
        return ctx
      }
      prec = ~~prec

      //initializes the result
      var result = ctx.pushRule(this)
      var fail, ok = false, ret = ctx
      //tests each alt (excpet those marked with a precedence value)
      for(var m of this.list){
        if(m.prec) continue
        ret = m.match(ctx.clone(), ...args)
        if(!ret.failed){
          ok = true
          break
        }
        //records the longes failed match in case everything fails and
        //we want a trace
        fail = (fail && fail.position < ret.position) || ret
      }
      ctx = ok? ret : (fail || ctx.fail())
      result.end = ctx.position
      var matching = ok

      while(matching){
        //assumes that the rule has (eventually left recursive) alternatives
        //which will be processed after the initial match
        ctx = ret
        ctx.position = result.start
        matching = false
        for(var m of this.list){
          //processes only items with a precedence greater
          //than the current one (which will be 0, if none supplied)
          if(!m.prec  || m.prec < prec) continue

          //recates a rule context for the matching rule
          var cur = ctx.swapRule(this)
          ret = m.match(ctx.clone(), result, ...args)
          if(!ret.failed){
            matching = true
            result = cur
            result.end = ret.position
            break
          }
        }
        //restores the original result if
        //the match failed; otherwise, does nothing
        ctx.swap(result)
        ctx.position = result.end
      }
      ctx.popAsChild(ok)
      return ctx
		}

		assign(...args){
      this.body = [...args]
			return this;
		}

		isNamed(value){
			return (this.name || "").toLowerCase() === (value || "").toLowerCase()
		}

    get valid(){
      return !!this.list.length
    }

		display(){
			return this.name
		}

		fullDisplay(options){
      options = options || {}
			var temp = this.display() + " = "
      var result
      var cr = options.noLineBreaks? "" : "\r\n"

      if(!this.list.length)  return temp + "<N/A>" + cr
      if(this.list.length === 1) return temp + this.list[0].display() + cr;

      var spc = (options.noSpaces || options.noLineBreaks)? "" : Array(temp.length - 1).join(" ")
			var sep = cr + spc + " | "

      return temp + this.list.map((v) => v.display(PREC_ALT)).join(sep) + cr
		}

		static create(name, value){
			return new Rule(name, value)
		}
	}

  return Rule
})
