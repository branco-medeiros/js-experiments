define(["peg/matcher"],
function(Matcher){

  var PREC_ALT = 10

  function noop(){}
  var emptyList = []

  function dispatch(fn, ...args){
    if(fn && fn instanceof Function) fn(...args)
  }

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

    resolveLeftRecursiveCall(ctx){
      //console.log(this.name + ": checking left-recursive call @" + ctx.position)
      var pos = ctx.position
      var rule = this
      var prev = ctx.result.find(function(v, i){
        return v.rule === rule && v.start === pos
      })

      if(prev){
        var v = prev.memo
        if(v){
          //console.log(this.name + ": found left recursive call with a previous value. accepting.")
          ctx.addResultValue(v)
          ctx.position = v.end
          return ctx
        }
        //console.log(this.name + ": found left recursive call without a previous value. rejecting.")
        return ctx.fail()
      }
      //console.log(this.name + ": no left-recursive calls found")
    }

    match(ctx, ...args){
      //ctx._vars.calls = ~~ctx._vars.calls + 1
      //if(ctx._vars.calls > 500) throw new Error("Something is not quite right...")

      var prev = this.resolveLeftRecursiveCall(ctx)
      if(prev) return prev

      //if a precedence was supplied, removes it from
      //the parameter list
      var prec = args[0]
      if(prec != null && prec.constructor === Number) {
        args = args.slice(1)
      } else {
        prec = 0
      }

      //initializes the result
      var result = ctx.pushRuleResult(this)
      this.onEnter(ctx)

      var fail, matched, ret
      for(var m of this.list){
        //tests each alt except those marked with a precedence value
        //which are supposed to be left recursive
        if(m.prec) continue
        ret = m.match(ctx.clone(), ...args)
        if(!ret.failed){
          matched = true
          result.matcher = m
          break
        }
        //records the longest failed match in case everything fails and
        //we want a trace
        fail = (fail && fail.position < ret.position) || ret
      }

      if(matched){
        ctx = ret
        result.end = ctx.position
        //console.log(this.name + ": trying to expand the current match (" + result.start + ":" + result.end + ")")
        //var loop = 0;
        while(matched){
          //assumes that the rule has (eventually left recursive) alternatives
          //which will be processed after the initial match;
          //these alternatives are marked with a precedence level greater than 1
          //and will only be considered if this precendence is greater than
          //the current precedence

          //rewinds the position to the start of the match
          ctx.position = result.start
          matched = false
          var cur = ctx.swapRuleResult(this)
          cur.memo = result
          for(var m of this.list){
            if(!m.prec  || m.prec <= prec) continue
            //console.log(this.name + "(" + (loop++) + ") : looping on alt " + (m.id || ("#" + this.list.indexOf(m))))
            ret = m.match(ctx.clone(), ...args)
            //console.log(this.name + ": ..." + (ret.failed? "failed": "succeeded"))
            if(!ret.failed){
              matched = true
              cur.matcher = m
              break;
            }
          }
          //if(loop > 1000) throw new Error("Infinte loop")
          cur.memo = undefined
          if(matched) {
            ctx = ret
            result = cur;
            result.end = ctx.position
            //console.log(this.name + ": updated result with the last match")
          } else {
            //console.log(this.name + ": no more matches, preparing to leave the loop ")
            ctx.position = result.end
            ctx.swapResult(result)
          }
        }
        this.onMatch(ctx)
        this.onLeave(ctx)
        ctx.popResultAsValue(true)

      } else {
        ctx = fail || ctx.fail()
        this.onLeave(ctx)
        ctx.popResult()
      }
      return ctx
		} //match

    match_old(ctx, ...args){
      var memo = ctx.getMemo(ctx.position, this.name)
      if(memo) {
        //if there's already a valid result for this rule in
        //the memo position, returns it
        ctx.addResultValue(memo)
        ctx.position = memo.end
        //console.log(this.name + ": fetched memo rule @" + memo.start + ":" + memo.end)
        return ctx
      }

      var prec = args[0]
      if(prec != null && prec.constructor === Number) {
        //if a precedence was supplied, removes it from
        //the parameter list
        args = args.slice(1)
      } else {
        prec = 0
      }

      //initializes the result
      var result = ctx.pushRuleResult(this)
      this.onEnter(ctx)

      var fail, matched, ret
      for(var m of this.list){
        //tests each alt except those marked with a precedence value
        //which are supposed to be left recursive
        if(m.prec) continue
        ret = m.match(ctx.clone(), ...args)
        if(!ret.failed){
          matched = true
          result.matcher = m
          break
        }
        //records the longest failed match in case everything fails and
        //we want a trace
        fail = (fail && fail.position < ret.position) || ret
      }

      if(matched){
        //console.log(this.name + ": trying to expand the current match")
        ctx = ret
        result.end = ctx.position
        ctx.setMemo(result.start, this.name, result)
        var loop =0;
        while(matched){
          //assumes that the rule has (eventually left recursive) alternatives
          //which will be processed after the initial match;
          //these alternatives are marked with a precedence level greater than 1
          //and will only be considered if this precendence is greater than
          //the current precedence

          //rewinds the position to the start of the match
          ctx.position = result.start
          matched = false
          var cur = ctx.swapRuleResult(this)
          for(var m of this.list){
            if(!m.prec  || m.prec <= prec) continue
            //console.log(this.name + "(" + (loop++) + ") : looping on alt " + (m.id || ("#" + this.list.indexOf(m))))
            ret = m.match(ctx.clone(), ...args)
            //console.log(this.name + ": ..." + (ret.failed? "failed": "succeeded"))
            if(!ret.failed){
              matched = true
              cur.matcher = m
              break;
            }
          }
          if(loop > 1000) throw new Error("Infinte loop")
          if(matched) {
            ctx = ret
            result = cur;
            result.end = ctx.position
            //console.log(this.name + ": updating memo @" + result.start + ":" + result.end)
            ctx.setMemo(result.start, this.name, result)
          } else {
            //console.log(this.name + ": no more matches, preparing to leave the loop ")
            ctx.position = result.end
            ctx.swapResult(result)
          }
        }
        this.onMatch(ctx)
        this.onLeave(ctx)
        ctx.popResultAsValue(true)

      } else {
        ctx = fail || ctx.fail()
        this.onLeave(ctx)
        ctx.popResult()
      }
      return ctx
		} //match_old


		assign(...args){
      this.body = [...args]
			return this;
		}

		isNamed(value){
			return (this.name || "").toLowerCase() === (value || "").toLowerCase()
		}

    get valid(){
      var bad = this.list.find((v) => !(v && v.isMatcher))
      return this.list.length && !bad
    }

    onEnter(ctx){
      dispatch(ctx.getVar("enter"), ctx)
    }

    onLeave(ctx){
      dispatch(ctx.getVar("leave"), ctx)
    }

    onMatch(ctx){
      dispatch(ctx.getVar("match"), ctx)
    }

		display(){
			return this.name
		}

		fullDisplay(options){
      options = options || {}
			var temp = this.display() + " = "
      var result
      var cr = options.noLineBreaks? "" : "\r\n"

      function displayAlt(v, prec){
          return (v.prec? (`%prec(${~~v.prec}) `) : "") + v.display(prec)
      }

      if(!this.list.length)  return temp + "<N/A>" + cr
      if(this.list.length === 1) return temp + displayAlt(this.list[0]) + cr;

      var spc = (options.noSpaces || options.noLineBreaks)? "" : Array(temp.length - 1).join(" ")
			var sep = cr + spc + " | "

      return temp + this.list.map((v) => displayAlt(v, PREC_ALT)).join(sep) + cr
		}

		static create(name, value){
			return new Rule(name, value)
		}
	}

  return Rule
})
