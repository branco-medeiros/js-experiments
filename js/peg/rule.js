define(["peg/matcher", "types/node"],
function(Matcher, Node){

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
        : (value instanceof Array? value.map(Matcher.from)
          : (value instanceof Matcher.Alt? value.list
            : [Matcher.from(value)]))
    }

    match_00(ctx, ...args){
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

		match_01(ctx, prec, ...args){
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
      var result = ctx.pushRule(this)
      var fail, ok = false, ret = ctx
      for(var m of this.list){
        if(m.prec) continue
        ret = m.match(ctx.clone(), ...args)
        if(!ret.failed){
          ok = true
          break
        }
        fail = (fail && fail.position < ret.position) || ret
      }
      ctx = ok? ret : (fail || ctx.fail())
      result.position = ctx.position
      var matching = ok
      while(matching){
        ctx = ret
        ctx.position = result.start
        matching = false
        for(var m of alts){
          if(!m.prec  || m.prec < prec) continue
          var cur = ctx.swapRule(this)
          ret = m.match(ctx.clone(), result, ...args)
          if(!ret.failed){
            matching = true
            result = cur
            result.end = ret.position
            break
          }
        }
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

		fullDisplay(){
			var temp = this.display() + " = "
      var result
			if(!this.list.length)  return temp + "<N/A>" + "\r\n"
			var spc = "\r\n" + Array(temp.length - 1).join(" ") + "| "
			return temp + this.list.map((v) => v.display()).join(spc) + "\r\n"
		}

		static create(name, value){
			return new Rule(name, value)
		}
	}

  return Rule
})
