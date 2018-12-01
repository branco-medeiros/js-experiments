define(["utils/test", "pratt/parser", "peg/peg", "types/context"],
function(test, Pratt, peg, Context){

  function testPrattParser(){
    test("pratt parser", function(chk, msg){

      var ctx = Context.from("1+2*(3+4)-5/10")
      var g = peg.grammar()
      var expr = g("expr")
      var r = chk("var r = Pratt.create(g('expr'))", Pratt.create(expr)).isValid()
      chk("r.assign(r.left(10, '+', r.ref))")


    })

  }


})
