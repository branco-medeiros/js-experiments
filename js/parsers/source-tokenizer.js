define(["parsers/source-token-grammar", "types/parser", "parsers/token"],
function(tokenGrammar, Parser, Token){

  var GRAMMAR = tokenGrammar()

  class SourceTokenizer extends Parser{

    constructor(src){
      super(GRAMMAR, src)
      var onToken = this.onToken.bind(this)
      for(var t of ["identifier", "number", "string", "operator", "unknown"]){
        this.onRuleLeave(t, onToken)
      }
    }

    onToken(info, ctx){
      if(ctx.failed) return
      var cap = ctx.globals.capture[1]
      this.result = Token.create(info.rule.name, cap.start, cap.end, ctx)
    }

    static create(src){
      return new Tokenizer(src)
    }

  }

  SourceTokenizer.GRAMMAR = GRAMMAR;


  return SourceTokenizer
})
