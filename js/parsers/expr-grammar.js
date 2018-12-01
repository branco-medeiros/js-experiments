define(["peg/peg"], function(peg){

  /*
    %start = decl-list

    decl-list = decl ("," decl)*

    decl = name:<identifier> ('=' value:expr | no-value:%eps)

    expr = logical-or

    logical-or = logical-and ('|' logical-and)*
    logical-and = comparison ('&' comparison)*
    comparison = sum (<compop> sum)*
    sum = prod (("+" | "-") prod)*
    prod = primary (("*" | "/") primary)*
    primary = "!" primary
            | "+" primary
            | "-" primary
            | <identifier>
            | <number>
            | group
    group = "(" expr ")"
  */

  function createGrammar(){

    var tk = {
      identifier: function(v){
        return v.id === "identifier"
      },

      number: function(v){
        return v.id === "number"
      },

      arithop: function(v){
        return v.id === 'arith-op'
      },

      compop: function(v){
        return v.id === "comp-op"
      }

    }

    var g = peg.grammar()

    g("%start").assign(g("decl-list"))

    g("decl-list").assign(
      g("decl"),
      peg.star(",", g("decl"))
    )

    g("decl").assign(
      g("identifier"),
      peg.opt("=", g("expr"))
    )

    g("expr").assign(g("logical-or"))

    g("logical-or").assign(
      g("logical-and"),
      peg.star("|", g("logical-and"))
    )

    g("logical-and").assign(
      g("equality"),
      peg.star("&", g("equality"))
    )

    g("equality").assign(
      g("sum"),
      peg.star(
        g("eq-op"),
        g("sum")
      )
    )

    g("eq-op").assign(tk.compop)

    g("sum").assign(
      g("prod"),
      peg.star(
        g("sum-op"),
        g("prod")
      )
    )

    g("sum-op").assign(peg.alt("+", "-"))

    g("prod").assign(
      g("primary"),
      peg.star(
        g("prod-op"),
        g("primary")
      )
    )

    g("prod-op").assign(peg.alt("*", "/"))

    g("primary").assign(peg.alt(
      g("unary-not"),
      g("unary-pos"),
      g("unary-neg"),
      g("identifier"),
      g("number"),
      g("group")
    ))

    g("unary-not").assign("!", g("primary"))
    g("unary-pos").assign("+", g("primary"))
    g("unary-neg").assign("-", g("primary"))
    g("identifier").assign(tk.identifier)
    g("number").assign(tk.number)

    g("group").assign(
      "(", g("expr"), ")"
    )

    return g

  }

  return createGrammar
})
