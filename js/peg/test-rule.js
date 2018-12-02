define(["utils/test", "utils/char-class", "./peg", "types/context"],
function(test, cc, peg, context){

  function testRuleDisplay(){
    test("RULE  -- display", function(chk, msg){

      var g = peg.grammar()
      var test = g("test")
      var options = {noLineBreaks: true}

      msg("Using rule 'test'...")
      chk("test.assign(cc.letter)", test.assign(cc.letter)).isValid()
      chk("...and test.body.length", test.body.length).is(1)
      chk("...and test.fullDisplay()", test.fullDisplay(options)).is("test = <letter>")

      //////////////////////////////////////////////////////////////////////////
      msg("")
      chk(
        "test.assign(cc.letter, cc.digit, cc.control)",
        test.assign(cc.letter, cc.digit, cc.control)
      ).isValid()

      chk("...and test..body.length", test.body.length).is(3)

      chk("...and test.fullDisplay()", test.fullDisplay(options))
      .is("test = <letter> | <digit> | <control>")

      //////////////////////////////////////////////////////////////////////////
      msg("")
      chk(
        "test.assign([cc.letter, cc.digit, cc.control])",
        test.assign([cc.letter, cc.digit, cc.control])
      ).isValid()

      chk("...and test.body.length", test.body.length).is(1)

      chk("...and test.fullDisplay()", test.fullDisplay(options))
      .is("test = <letter> <digit> <control>")
    })
  } //testRuleDisplay

  function testSimpleMatch(){
    test("RULE -- simple match", function(chk, msg){
      var g = peg.grammar()
      var options = {noLineBreaks: true}
      var ident = g("ident").assign([
          cc.letter,
          peg.star(
            peg.alt(
              peg.plus(cc.alphanum),
              [peg.alt(".", "_", "-"), peg.plus(cc.alphanum)]
            )
          )
        ])
      msg("Using the 'ident' rule bellow:")
      msg(ident.fullDisplay())

      var ctx = context.from("abc.1234-x_y_z")

      //////////////////////////////////////////////////////////////////////////
      var ret = chk(`ret = ident.match(${ctx})`, ident.match(ctx)).isValid()
      chk("...and ret.finished", ret.finished).isTrue()
      chk("...and ret.result.peek()",  ret.result.peek().toString())
      .is("(N/R 0:? (ident 0:14))")

    })
  } //testSimpleMatch

  function testSubRuleMatch(){
    test("RULE -- sub rule match", function(chk, msg){
      var g = peg.grammar()
      var options = {noLineBreaks: true}
      var identFirst = g("ident-first").assign(cc.letter)
      var identText = g("ident-text").assign(peg.plus(cc.alphanum))
      var identSep = g("ident-sep").assign([peg.alt(".", "_", "-"), identText])
      var ident = g("ident").assign([identFirst, peg.star(peg.alt(identText, identSep))])

      msg("For the following grammar:")
      msg(ident.fullDisplay(options))
      msg(identFirst.fullDisplay(options))
      msg(identText.fullDisplay(options))
      msg(identSep.fullDisplay(options))

      ctx = context.from("abc.1234-x_y_z")

      //////////////////////////////////////////////////////////////////////////
      ret = chk(`ret = ident.match(${ctx})`, ident.match(ctx)).isValid()
      chk("...and ret.finished", ret.finished).isTrue()
      chk("...and ret.peekResult()", "\r\n" + ret.peekResult().display(2))
      .is(
        "\r\n" +
        "(N/R 0:?\r\n" +
        " (ident 0:14\r\n" +
        " (ident-first 0:1)\r\n" +
        " (ident-text 1:3)\r\n" +
        " (ident-sep 3:8 (ident-text 4:8))\r\n" +
        " (ident-sep 8:10 (ident-text 9:10))\r\n" +
        " (ident-sep 10:12 (ident-text 11:12))\r\n" +
        " (ident-sep 12:14 (ident-text 13:14))" +
        "))"
      )

    })
  } //testSubRuleMatch

  function testDirectLeftRecursiveMatch(){
    test("RULE -- direct left recursive match", function(chk, msg){

      var g = peg.grammar()
      var options = {noLineBreaks: true}
      var expr = g("expr").assign([g("expr"), "+", "n"], "n")
      expr.body[0].prec = 10

      msg("For the 'expr' rule bellow:")
      msg(expr.fullDisplay(options))

      ctx= context.from("n+n+n")

      //////////////////////////////////////////////////////////////////////////
      ret = chk(`ret = expr.match(${ctx})`, expr.match(ctx)).isValid()
      chk("...and ret.finished", ret.finished).isTrue()
      chk("...and ret.peekResult()", ret.peekResult().toString())
      .is("(N/R 0:? (expr 0:5 (expr 0:3 (expr 0:1))))")

      window.retVal = ret

    })
  } //testDirectLeftRecursiveMatch


  return test.asTest({
    testRuleDisplay: testRuleDisplay,
    testSimpleMatch: testSimpleMatch,
    testSubRuleMatch: testSubRuleMatch,
    testDirectLeftRecursiveMatch: testDirectLeftRecursiveMatch
  })

})
