define(["types/context", "types/grammar", "peg/matcher", "peg/rule"],
function(Context, Grammar, Matcher, Rule, MemoRule){


	class Peg{
		static lit(v){
			return new Matcher.Lit(v);
		}

		static any(){
			return new Matcher.Any()
		}

		static eps(){
			return new Matcher.Epsilon()
		}

		static seq(...args){
			return new Matcher.Seq(Matcher.fromList(...args))
		}

		static alt(...args){
			return new Matcher.Alt(Matcher.fromList(...args))
		}

		static rep(min, max, ...args){
			return new Matcher.Rep(min, max, Matcher.from(...args))
		}

		static opt(...args){
			return Peg.rep(null, 1, Matcher.from(...args))
		}

		static plus(...args){
			return Peg.rep(1, null, Matcher.from(...args))
		}

		static star(...args){
			return Peg.rep(null, null, Matcher.from(...args))
		}

		static oneof(v){
			return new Matcher.OneOf(v)
		}

		static str(v){
			if(!v) throw new Error("Invalid str")
			if(v.constructor === String) v = v.split("")
			if(!(v instanceof Array)) v = [v]
			return Peg.seq.call(null, v)
		}

		static is(...args){
			return new Matcher.Is(Matcher.from(...args))
		}

		static isnt(...args){
			return new Matcher.IsNot(Matcher.from(...args))
		}

		static cap(id, ...args){
			return new Matcher.Capture(id, Matcher.from(...args))
		}

		static fn(fn){
			return new Matcher.Fn(fn)
		}

		static warn(msg){
			return new Matcher.Warning(msg)
		}

		static fail(msg){
			return new Matcher.Failure(msg)
		}

		static abort(msg){
			return new Matcher.Abort(msg)
		}

		static pcall(rule, prec){
			return new Matcher.PCall(rule, prec)
		}

		static prec(prec, ...args){
			if(prec == null || prec.constructor !== Number) throw new Error("Invalid prec:" + prec)
			var r = Matcher.from(...args)
			r.prec = prec
			return r
		}

	 	static grammar(){
			var g = Grammar.createFn(createRule)
			return g
		}

	}

	function createRule(name){
			return Rule.create(name)
	}

	Peg.types = {
		Context: Context,
		Grammar: Grammar,
		Rule: Rule,
		Matcher: Matcher
	}

	Peg.ANY = new Matcher.Any()
	Peg.EPS = new Matcher.Epsilon()


	return Peg

})
