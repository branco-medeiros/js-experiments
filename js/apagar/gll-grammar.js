define(["./gll-rule"], function(Rule){

  function GrammarFn(ref, name){

    if(!name) return ref.startRule

    name = name + ""
    var key = name.toLowerCase()

    var r = ref.names[key]
    if(!r){
      r = new Rule(name)
      ref.names[key] = r;
      ref.rules.push(r)
    })

    if(!ref.startRule) ref.startRule = r
    return r
  }

  function Assign(g, other){
    for(rule of other.rules){
      var cur = g(rule.name)
      if(!cur.count) cur.assign(rule)
    }

    var v = other.startRule
    g.startRule = v? g(v.name) : null
    return g
  }

  function Grammar(){
    var ref = {rules:[], names:[], startRule: null}
    var g = GrammarFn.bind(null, ref)
    g.ref = ref;

    Object.defineProperty(g, "rules", {get: function(){return ref.rules}})
    Object.defineProperty(g, "names", {get: function(){return ref.names}})
    Object.defineProperty(g, "startRule", {
      get: function(){return ref.startRule},
      set: function(value){ ref.startRule = v}
    })

    g.assign = Assign.bind(null, g)


    return g
  }


  return Grammar

})
