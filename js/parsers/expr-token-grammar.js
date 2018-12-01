define(["peg/peg", "utils/char-class"],
/*
  token = identifier
        | number
        | operator
        | unknown

  identifier = ident-body ('.' ident-body)*
  number = digits (frac | exp)?
         | frac

  operator = arith-operator
           | comp-operator
           | other-operator

  unknown = %any

  ident-body = ('_'| <letter>) (<letter>|'_'| <digit>)*

  digits = <digit>+
  frac = '.' digits exp?
  exp = %oneof "eE" (%oneof "+-")? digits

  arith-operator = %oneof('+-/*')
  comp-operator = '=' (%oneof '<>')?
                | '<' '='?
                | '>' '='?
                | '!' '='?
  other-operator = %oneof '()|&'

*/

function(peg, cc){

  function createGrammar(){
    var g = peg.grammar()

    g("token").assign(peg.alt(
      g("identifier"),
      g("number"),
      g("comp-op"),
      g("arith-op"),
      g("operator"),
      g("separator"),
      g("unknown")
    ))

    g("identifier").assign(
      g("ident-body"),
      peg.star(".", g("ident-body"))
    )

    g("number").assign(peg.alt(
      [g("digits"), peg.opt(peg.alt(g("exp"), g("frac")))],
      g("frac")
    ))

    g("comp-op").assign(peg.alt(
      ["=", peg.opt(peg.oneof("<>"))],
      ["<", peg.opt("=")],
      [">", peg.opt("=")],
      ["!", peg.opt("=")]
    ))

    g("arith-op").assign(peg.oneof("+-*/"))

    g("operator").assign(peg.oneof("()|&"))

    g("separator").assign(peg.lit(","))

    g("unknown").assign(peg.ANY)

    g("digits").assign(peg.plus(cc.digit))

    g("exp").assign(
      peg.oneof("eE"),
      peg.opt(peg.oneof("+-")),
      g("digits")
    )

    g("frac").assign(
      ".", g("digits"), peg.opt(g("exp"))
    )


    g("ident-body").assign(
      peg.alt(cc.letter, "_"),
      peg.star(peg.alt(
        cc.letter,
        "_",
        cc.digit
      ))
    )

    return g
  }

  return createGrammar;

})
