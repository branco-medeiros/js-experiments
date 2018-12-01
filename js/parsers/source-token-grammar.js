define(["peg/peg", "utils/char-class", ], function(peg, cc){

  //grammar
  /**
    << spc* [token]
    token = identifier
          | number
          | string
          | operator
          | unknown

    identifier = [({letter} | "_") ({letter} | {digit} | "_")*  ] spc*

    number = [num | frac] spc*
    num = {digit}+ (dec | exp)?
    frac = "." {digit}+ exp?
    exp =  %oneof "eE" (%oneof "+-")? {digit}+

    string = '"' [char*] '"' spc*
    char = "\" {printable} | %not '"' %any

    operator =
            [%oneof "(){}[]!%"
            | "=" (%oneof "=><")?
            | "+" (%oneof "+=")?
            | "-" (%oneof "-=>")?
            | "<" (%oneof "=<")?
            | ">" (%oneof "=>")?
            | "/" (%not %oneof "/*") "="?
            | ":" ":"?
          ] spc*

    unknown = %any

    spc = whitespace
        | comment
        | new-line

    whitespace = {blank}

    comment = single-line-comment
            | multi-line-comment

    single-line-comment = %str "//" {printable}*
    multi-line-comment = %str "/*" (%not ("*" "/") %any)* ("*" "/")

    new-line = {cr} {lf}? | {lf}
  */

  function createGrammar(){
    var g = peg.grammar();
    var start = g("")

    var SPC = peg.star(g("spc"))
    start.assign(
      SPC,
      peg.cap("", g("token"))
    )

    g("token").assign(
      peg.alt(
        g("identifier"),
        g("number"),
        g("string"),
        g("operator"),
        g("unknown")
      )
    )

    g("identifier").assign(
      peg.cap("identifier",
        peg.alt(cc.letter, "_"),
        peg.star(
          peg.alt(
            cc.letter,
            cc.digit,
            "_"
          )
        )
      ),
      SPC
    );

    g("number").assign(
      peg.cap("number", peg.alt(g("num"), g("frac"))),
      SPC
    )

    g("num").assign(
      peg.plus(cc.digit),
      peg.opt(g("frac"), g("exp"))
    )

    g("frac").assign(
      ".", peg.plus(cc.digit), peg.opt(g("exp"))
    )

    g("exp").assign(
      peg.oneof("eE"),
      peg.opt(peg.oneof("+-")),
      peg.plus(cc.digit)
    )

    g("string").assign(
      '"',
      peg.cap("string", peg.star(g("char"))),
      peg.alt('"', peg.warn("unclosed-string")),
      SPC
    )

    g("char").assign(
      peg.alt(
        ["\\", cc.printable],
        [peg.isnt('"'), cc.printable]
      )
    )

    g("operator").assign(
      peg.cap(
        "operator",
        peg.alt(
          peg.oneof("(){}[]!%;,.?!~"),
          ["=", peg.opt(peg.oneof("=><"))],
          ["+", peg.opt(peg.oneof("+="))],
          ["-", peg.opt(peg.oneof("-=>"))],
          ["<", peg.opt(peg.oneof("<="))],
          [">", peg.opt(peg.oneof("=>"))],
          ["/", peg.isnt(peg.oneof("/*")), peg.opt("=")],
          [":", peg.opt(":")]
        )
      ),
      SPC
    )

    g("unknown").assign(
      peg.cap("unknown", peg.ANY)
    )

    g("spc").assign(
      peg.alt(
        g("whitespace"),
        g("comment"),
        g("new-line")
      )
    )

    g("whitespace").assign(
      cc.blank
    )

    g("comment").assign(
      peg.alt(
        g("single-line-comment"),
        g("multi-line-comment")
      )
    )

    g("single-line-comment").assign(
      peg.str("//"),
      peg.star(cc.printable)
    )

    g("multi-line-comment").assign(
      peg.str("/*"),
      peg.star(peg.isnt(peg.str("*/")), peg.any()),
      peg.alt(peg.str("*/"), peg.warn("unclosed-comment"))
    )

    g("new-line").assign(
      peg.alt(
        [cc.cr, peg.opt(cc.lf)],
        cc.lf
      )
    )

    return g
  }

  return createGrammar

})
