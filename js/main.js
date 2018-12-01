define([
  "parsers/source-tokenizer", "parsers/source-parser",
  "parsers/expr-tokenizer",
  "gll/rule",
  "peg/test-peg", "types/test-context", "types/test-list",
  "peg/test-memo-rule"
],
function(SourceTokenizer, SourceParser, ExprTokenizer,
  gllRule,
  testPeg, testContext, testList, testMemo
){

  function vm(){
    var self = this;
    self.hello = ko.observable("Hello, jpeg")

    self.runExprTokenizer = function(){
      var source = $("#expr-source-code").text();
      var parser = new ExprTokenizer(source)
      self.expr_tokenizer_Source = source;
      self.expr_tokenizer_Parser = parser;

      console.log("PARSING")
      while(parser.next()){
        var v = parser.result
        console.log("" + v, {value:v? v.value : "N/A"})
      }
      console.log("DONE")
    }

    self.runTokenizer = function(){
      var source = $("#source-code").text();
      var parser = new SourceTokenizer(source)
      self.tokenizer_Source = source;
      self.tokenizer_Parser = parser;

      console.log("PARSING")
      while(parser.next()){
        var v = parser.result
        console.log("" + v, {value:v? v.value : "N/A"})
      }
      console.log("DONE")
    }

    self.runSourceParser = function(){
      var source = $("#source-code").text();

      var tokens = new SourceTokenizer(source)
      self.sourceParser_Tokens = tokens

      var parser = new SourceParser()
      self.sourceParser_Parser = parser;

      //var lazyList = tokens.asList()
      //self.sourceParser_Source = lazyList

      //parser.source = lazyList
      parser.source = tokens

      console.log("PARSING")
      while(parser.next()){
        console.log(parser.result)
      }
      console.log("DONE")

    }

    self.testPeg = function(){
      test(testPeg)
    }

    self.testList = function(){
      test(testList)
    }

    self.testContext = function(){
      test(testContext)
    }

    self.testMemo = function(){
      test(testMemo)
    }

    function test(what){
      if(what instanceof Function) {
        what()
      } else {
        for(var k in what){
          var fn = what[k]
          if(fn instanceof Function) fn()
        }
      }
    }
  }

  return vm
})
