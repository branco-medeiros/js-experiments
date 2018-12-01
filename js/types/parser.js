define(["types/grammar", "types/Context", "types/enum-list"],
function(Grammar, Context, LazyList){


  class Parser{
    constructor(grammar, src){
      if(!(grammar.isGrammar || grammar.isGrammarFn) ) throw new Error("Invalid Grammar")

      var self = this;
      this[Symbol.iterator] = function(){
        return {
          next: function(){
            var v =  self.next();
            return {value:v, done:!v}
          }
        }
      }

      this._grammar = grammar
      this.source = src
    }

    get source(){
      return this._source
    }

    set source(value){
      if(value instanceof Parser){
        value = value.asList()
      }
      value = value || []
      this._source = value
      this.init = Context.from(value)
      this.reset()
    }

    get grammar(){
      return this._grammar
    }

    setListener(listeners, id, fn){
      if(!fn || fn.constructor !== Function) throw new Error("Invalid fn");
      listeners[id] = fn;
    }

    onRuleMatch(id, fn){
      if(!this._matchListeners) this._matchListeners = {}
      this.setListener(this._matchListeners, id, fn)
    }

    onRuleEnter(id, fn){
      if(!this._enterListeners) this._enterListeners = {}
      this.setListener(this._enterListeners, id, fn)
    }

    onRuleLeave(id, fn){
      if(!this._leaveListeners) this._leaveListeners = {}
      this.setListener(this._leaveListeners, id, fn)
    }

    dispatch(listeners, info, ...args){
      var fn = listeners && listeners[info.rule.name]
      if(fn) fn(info, ...args)
    }

    handleEnter(info, ...args){
      this.dispatch(this._enterListeners, info, ...args)
    }

    handleMatch(info, ...args){
      this.dispatch(this._matchListeners, info, ...args)
    }

    handleLeave(info, ...args){
      this.dispatch(this._leaveListeners, info, ...args)
    }

    next(){
      this.result = null
      var ctx = this.ctx
      if(!ctx.failed && !ctx.finished) {
        ctx.clearGlobals()
        ctx = this.grammar.get().match(ctx);
        this.ctx = ctx
      }
      return this.result
    }

    asList(){
      return new LazyList(this[Symbol.iterator]())
    }

    reset(){
      this.ctx = Context.from(this.init.source).setPosition(this.init.position)
      this.ctx.addListener("enter", this.handleEnter.bind(this))
      this.ctx.addListener("leave", this.handleLeave.bind(this))
      this.ctx.addListener("match", this.handleMatch.bind(this))
    }
  }

  return Parser

})
