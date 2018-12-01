define(["parsers/expr-token-grammar", "parsers/token", "types/parser"],
function(createGrammar, Token, Parser){

  var GRAMMAR = createGrammar();

  class ExprTokenizer extends Parser{

    constructor(src){
      super(GRAMMAR, src);

      var onToken = this.onToken.bind(this);
      for(var tk of [
        "identifier", "number", "string", "arith-op",
        "comp-op", "operator", "separator", "unknown"
      ]){
        this.onRuleMatch(tk, onToken)
      }
    }

    onToken(info, ctx){
      this.result = Token.create(
        info.rule.name, info.start, info.end, ctx
      )
    }

    static create(src){
      return new ExprTokenizer(src)
    }

  }

  ExprTokenizer.GRAMMAR = GRAMMAR;

  return ExprTokenizer

})
