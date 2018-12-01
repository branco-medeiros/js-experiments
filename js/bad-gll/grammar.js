define(["types/grammar", "gll/rule"],
function(Grammar, Rule){

  return {
    create: function(){
      return Grammar.create(Rule.create)
    },

    createFn: function(){
      return Grammar.createFn(Rule.create)
    }
  }


})
