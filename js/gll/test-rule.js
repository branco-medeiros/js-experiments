define(["gll/rule", "gll/grammar", "utils/test", "parsers/tokenizer"],
function(Rule, Grammar, test, Tokenizer){

  function testCreateAndDisplay(){
    test("Rule - create and display", function(chk, msg){
      var rule = chk("var rule = new Rule('test')", new Rule("test")).mustSucceed()
      chk("rule.lit('a')", rule.lit('a')).mustSucceed()
      chk("rule.fullDisplay()", rule.fullDisplay()).mustSucceed()
    })
  }

  function testAssignment(){

    test("Rule - assignment", function(chk, msg){
      var rule = chk("var rule = new Rule('test')", new Rule("test")).mustSucceed()

      msg("//lets use the Tokenizer.GRAMMAR('multi-line-comment') rule:")
      msg("var test = Tokenizer.GRAMMAR('multi-line-comment')")
      var test = Tokenizer.GRAMMAR("multi-line-comment")
      msg("// ", test.fullDisplay())

      chk("rule.assign(test)", rule.assign(test)).mustSucceed()
      chk("rule.fullDisplay()", rule.fullDisplay()).mustSucceed()
    })
  }

  function testRuleWithGrammar(){
    test("Rule - with grammar", function(chk, msg){

      var g = chk("var g = Grammar.create()", Grammar.create()).mustSucceed()
      var rule = chk("var rule = g.get('test')", g.get("test")).mustSucceed()
      chk("rule.grammar", rule.grammar).isValid()

      msg("//lets use the Tokenizer.GRAMMAR('identifier') rule:")
      msg("var test = Tokenizer.GRAMMAR('identifier')")
      var test = Tokenizer.GRAMMAR("identifier")
      msg("// ", test.fullDisplay())


      chk("rule.assign(test)", rule.assign(test)).mustSucceed()
      chk("g.contains('whitespace')", g.contains("whitespace")).isTrue()
      chk("g.contains('comment')", g.contains("comment")).isTrue()
      chk("g.contains('new-line')", g.contains("new-line")).isTrue()
      chk("rule.fullDisplay", rule.fullDisplay()).mustSucceed()
    })
  }

  return {
    testCreateAndDisplay: testCreateAndDisplay,
    testAssignment: testAssignment,
    testRuleWithGrammar: testRuleWithGrammar
  }
})
