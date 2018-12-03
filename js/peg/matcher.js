define(["utils/quote", "types/context", "utils/parenthise"],
function(quote, Context, parenthize){

  var PREC_EXPR = 5
  var PREC_ALT = 10
  var PREC_SEQ = 20
  var PREC_CAP = 30
  var PREC_ONEOF = 40
  var PREC_IS = 50
  var PREC_REP = 60

  class Matcher{
		//defines the base Matcher class; it must implement match(ctx)
		//which will try to match the supplied Context with the matcher content;
		//returns ctx.succeed() on success (which may or may not increment the current position)
		//returns ctx.failed on error
    constructor(){
      this.isMatcher = true
    }

		match(ctx){ return ctx.fail() }

		static from(...args){
      var v
      if(args.length === 1){
        v = args[0]

      } else if(args.length){
        v = [...args]

      } else {
        v = null
      }

			if(v instanceof Matcher) return v
			if(v instanceof Array) {
				if(v.length === 1) return Matcher.from(v[0])
				return new Seq(Matcher.fromList.apply(null, v))
			}
			return new Lit(v)
		}

		static fromList(...args){
			var result = [];
			for(let v of args) {
				result.push(Matcher.from(v))
			}
			return result;
		}

		static fromArgs(args, start){
			var result = []
			for(var i = start || 0, max = args.length; i < max; ++i){
				result.push(args[i])
			}
			return Matcher.from(result)
		}

    toString(){
      if(this.display) return this.display()
      return super.toString()
    }
	} //Matcher

  class Lit extends Matcher{
		constructor(value){
			super()
			this.value = value
      this.isLit = true
		}

		match(ctx){
			var c = ctx.current
			var v = this.value;
			if(c == null || v == null) return ctx.fail()

			var ok = false
			while(true){

				if(v instanceof Function){
					ok = v(c)
					break;
				}

				if(v.equals instanceof Function){
					ok = v.equals(c)
					if(ok) break
				}

				if(c.equals instanceof Function){
					ok = c.equals(v)
					if(ok) break
				}

				ok = c === v
				break;
			}

			if(ok) {
				ctx.moveNext()
				return ctx
			}

			return ctx.fail()
		}

		display(){
			if(this.value instanceof Function){
				return "<" + this.value.name + ">"
			}
			return quote(this.value, "'")
		}

	}

	class ListMatcher extends Matcher {
		constructor(list){
			super()
			if(!(list instanceof Array)) throw new Error("Invalid list")
			this.list = list
		}
	}

  class Alt extends ListMatcher {
		constructor(list){
			super(list)
      this.isAlt = true
		}

		match(ctx, ...args){
			var fail = null;
			for(let m of this.list){
				var r = m.match(ctx.clone(), ...args);
				if(r.accepted) return r;
				if(!fail || fail.position < r.position){
					fail = r
				}
			}
			return fail? fail : ctx.fail();
		}

		display(prec){
      var iprec = PREC_ALT
			var temp = []
			this.list.forEach((v) => temp.push(v.display(iprec)))
			return parenthize(temp.join(" | "), prec, iprec)
		}
	}

	class Seq extends ListMatcher {
		constructor(list){
			super(list)
      this.isSeq = true
		}

		match(ctx, ...args){
			for(let m of this.list){
				ctx = m.match(ctx, ...args);
				if(ctx.failed) break;
			}
			return ctx;
		}

		display(prec){
      var iprec = PREC_SEQ
			if(this.list.length === 1) return this.list[0].display(prec-1)
			var temp = []
			this.list.forEach((v) => temp.push(v.display(iprec-1)))
			return parenthize(temp.join(" "), prec, iprec)
		}
	}

	class ValueMatcher extends Matcher {
		constructor(value){
			super()
			if(!(value instanceof Matcher)) throw new Error("invalid value")
			this.value = value
		}
	}

	class Rep extends ValueMatcher {
		constructor(min, max, value){
			super(value)
			this.min = min;
			this.max = max;
      this.isRep = true
		}

		match(ctx, ...args){
			var min = this.min
			var max = this.max;
			var m = this.value
			var count = 0;
			var p2 = ctx.position;
			while(true){
				var p = p2;
				var r = m.match(ctx.clone(), ...args);
				if(r.failed) break;

				ctx = r;
				count +=1;
				if(max && count >= max) break;

				p2 = ctx.position;
				if(p === p2) break;

			}
			if(min && count < min) return ctx.fail();
			return ctx.accept();
		}

		display(prec){
      var iprec = PREC_REP

			if(!this.min && !this.max){
				return this.value.display(iprec) + "*"
			}

			if(!this.min && this.max === 1){
				return this.value.display(iprec) + "?"
			}

			if(this.min === 1 && !this.max){
				return this.value.display(iprec) + "+"
			}

			if(!this.min) return this.value.display(iprec) + "{," + this.max + "}"
			if(!this.max) return this.value.display(iprec) + "{" + this.min + "}"
			return  this.value.display(iprec) + "{"+ this.min + ", " + this.max + "}"
		}
	}

	class OneOf extends Matcher {
		constructor(value){
			super()
			if(!value || !value.indexOf) throw new Error("Invalid value")
			this.value = value
      this.isOneOf = true
		}

		match(ctx){
			var v = this.value
			var c = ctx.current
			if(v.indexOf(c) >= 0){
				ctx.moveNext()
				return ctx
			}

			return ctx.fail()
		}

		display(prec){
      var iprec = PREC_ONEOF
			return parenthize("%oneof " + quote(this.value, "'"), prec, iprec)
		}
	}

	class Is extends ValueMatcher {
		constructor(value){
			super(value)
      this.isIs = true
		}

		match(ctx, ...args){
      var ctx2 = Context.from(ctx.source).setPosition(ctx.position)
			return this.value.match(ctx2, ...args).failed
				? ctx.fail()
				: ctx.accept();
		}

		display(prec){
      var iprec = PREC_IS
			return parenthize("%is " + this.value.display(iprec), prec, iprec)
		}
	}

	class IsNot extends ValueMatcher {
		constructor(value){
			super(value)
      this.isIsNot = true
		}

		match(ctx, ...args){
      var ctx2 = Context.from(ctx.source).setPosition(ctx.position)
			return this.value.match(ctx2, ...args).failed
				? ctx.accept()
				: ctx.fail();
		}

		display(prec){
      var iprec = PREC_IS
			return parenthize("%isnt " + this.value.display(iprec), prec, iprec)
		}
	}

	class Capture extends ValueMatcher {

			constructor(id, value){
				super(value)
				this.id = id;
        this.isCapture = true
			}

			match(ctx, ...args){

				var v = {id: this.id, start: ctx.position, value:this.value}
        var caps = ctx.result.captures
        if(!caps) ctx.result.captures =  caps = []
        caps.push(v)
        var idx = caps.length
				ctx = this.value.match(ctx, ...args)
				if(!ctx.failed) {
          //creates a reference to this capture in
          // result.captures[]
          //if there are 'sub-captures' save then into this captures 'children'
          v.end = ctx.position
          v.children = caps.splice(idx)
				} else {
          caps.splice(idx-1)
        }
				return ctx
			}

			display(){
        var iprec = PREC_CAP
        var noname = this.id == null || !this.id.length
        if(noname) return "[" + this.value.display() + "]"
				return this.id + ":" + this.value.display(iprec)
			}
	}

	class Any extends Matcher{
    constructor(){
      super()
      this.isAny = true
    }
		match(ctx){
			return ctx.moveNext() || ctx.fail()
		}

		display(){
			return "%any"
		}
	}

	class Epsilon extends Matcher{
    constructor(){
      super()
      this.isEpsilon = true
    }

		match(ctx){
			return ctx
		}

		display(){
			return "%eps"
		}
	}

	class Fn extends Matcher{
    //represents a function that accepts a context and returns true or false
    //indicating success of failure
		constructor(fn){
			super()
			if(!(fn instanceof Function)) throw new Error("Invalid fn")
			this.fn = fn
      this.isFn = true
		}

		match(ctx, ...args){
			this.fn(ctx, ...args)
      return ctx
		}

		display(){
			return "%fn(" + ((this.fn && this.fn.name) || "...") + ")"
		}
	}

  class Warning extends Matcher{
    constructor(msg){
      super()
      this.msg = msg
      this.isWarning = true
    }

    match(ctx){
      var e = ctx.globals.errors
      if(!e) {
        e = []
        ctx.globals.errors = e;
      }
      e.push({msg: this.msg, pos: ctx.position})
      return ctx;
    }

    display(){
      return "%warn(" + quote(this.msg, "'")  + ")";
    }
  }

  class Failure extends Warning{
    constructor(msg){
      super(msg)
      this.isFailure = true
    }

    match(ctx){
      return super.match(ctx).fail()
    }

    display(){
      return "%fail(" + quote(this.msg, "'") + ")";
    }
  }

  class Abort extends Matcher{
    constructor(msg){
      super()
      this.msg = msg
      this.isAbort = true
    }

    match(ctx){
      var err = new Error(msg)
      err.position = ctx.position
      erro.context = ctx;
      throw err
    }

    display(){
      return "%abort(" + quote(this.msg, "'") + ")";
    }
  }

  class PCall extends ValueMatcher{
    constructor(rule, prec){
      if(!rule.isRule) throw new Error("Invalid rule parameter: " + rule)
      if(prec == null || prec.constructor !== Number ) Error("Invalid precedence: " + prec)
      super(rule)
      this.prec = prec
      this.isPCall = true
    }

    match(ctx, ...args){
      return this.value.match(ctx, this.prec, ...args)
    }

    display(){
      return `%pcall(${this.value.display()}, ${this.prec})`
    }
  }

  Matcher.Lit = Lit
  Matcher.ListMatcher = ListMatcher
  Matcher.Seq = Seq
  Matcher.Alt = Alt
  Matcher.ValueMatcher = ValueMatcher
  Matcher.Rep = Rep
  Matcher.OneOf = OneOf
  Matcher.Is = Is
  Matcher.IsNot = IsNot
  Matcher.Capture = Capture
  Matcher.Any = Any
  Matcher.Epsilon = Epsilon
  Matcher.Fn = Fn
  Matcher.Warning = Warning
  Matcher.Failure = Failure
  Matcher.Abort = Abort
  Matcher.PCall = PCall

  return Matcher
})
