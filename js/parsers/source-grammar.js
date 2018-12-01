define(["peg/peg"], function(Peg){

  //grammar
  /**
    << (lines:line | errors: error) +
    line = list:<identifier> "->" cmd:<identifier> "("
            value:(single-command | multi-command)
           ")" ";"

    single-command = [<string>] comment?
    multi-command = target-list:<identifier> ","
                    value-or-condition:<string>
                    ("," condition:<string> comment?)?

    comment = "," <string>+
    error: (%isnot ";" %any)* ";"

  */

  var cc = {
    string: function(token){ return token.id === "string"},
    identifier: function(token){ return token.id === "identifier"}
  }

  var p = Peg
  
  function createGrammar(){
    var g = p.grammar();

    g("").assign(
      p.alt(
        g("line"),
        g("error")
      )
    )

    g("line").assign(
      p.cap("list", cc.identifier),
      "->",
      p.cap("cmd", cc.identifier),
      "(",
      p.alt(
        g("single-command"),
        g("multi-command")
      ),
      ")",
      ";"
    )

    g("single-command").assign(
      p.cap("single-command", cc.string),
      p.opt(g("comment"))
    )

    g("multi-command").assign(
      p.cap("target-list", cc.identifier),
      ",",
      p.cap("value-or-condition", cc.string),
      p.opt(
        ",",
        p.cap("condition", cc.string),
        p.opt(g("comment"))
      )
    )

    g("comment").assign(",", p.plus(cc.string))

    g("error").assign(
      p.star(p.isnt(";"), p.ANY),
      ";"
    )

    return g;
  }


return createGrammar


})
