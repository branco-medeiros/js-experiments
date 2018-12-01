define([], function(){
  class Grammar{

		constructor(factory){
			if(!(factory instanceof Function)) throw new Error("Invalid rule factory")
			this.createRule = factory
			this.names = {}
			this.rules = []
			this.startRule = null
      this.isGrammar = true
		}

		get(name){
			var self = this
			if(arguments.length === 0){
				if(!self.startRule) throw new Error("no start rule")
				return self.startRule
			}

			var k = ("" + name).toLowerCase();
			var rule = self.names[k]
			if(!rule){
				rule = self.createRule(...arguments)
				self.names[k] = rule
				self.rules.push(rule)
        rule.grammar = self
			}

			if(!self.startRule) self.startRule = rule
			return rule
		}

		display(){
      var start = self.startRule;
			return this.rules.map(function(r){
        return (r === start? "%start " : "") + r.fullDisplay()
      }).join("\r\n")
		}

		verify(){
			var result = {
				invalidRules: this.rules.filter((r) = !r.valid),
				noRules: !this.rules.length
			}
			return result
		}

    contains(name){
      var k = ("" + name).toLowerCase();
      return this.names[k] != null
    }

		static create(ruleFactory){
			return new Grammar(ruleFactory)
		}

		static createFn(ruleFactory){
			var ref = new Grammar(ruleFactory);
			var g = ref.get.bind(ref);
      g.isGrammarFn = true
			g.ref = ref;
      g.get = ref.get.bind(ref)
			g.verify = ref.verify.bind(ref);
			g.display = ref.display.bind(ref)
      g.contains = ref.contains.bind(ref)

			Object.defineProperty(g, "names", {get: function(){ return ref.names}})
			Object.defineProperty(g, "rules", {get: function(){ return ref.rules}})
			Object.defineProperty(g, "createRule", {get: function(){ return ref.createRule}})
			Object.defineProperty(g, "startRule", {
				get: function(){ return ref.startRule},
				set: function(v){ ref.startRule = v}
			})
			return g
		}

	}

  return Grammar

})
