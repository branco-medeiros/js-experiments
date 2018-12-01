define(["parsers/source-grammar", "types/parser"],
function(sourceGrammar, Parser){

  var GRAMMAR = sourceGrammar()


  class SourceParser extends Parser{
    constructor(src){
      super(GRAMMAR, src)

      this.onRuleLeave("line", this.onLine.bind(this))
      this.onRuleLeave("error", this.onError.bind(this))
    }

    onLine(info, ctx){
      if(ctx.failed) return
      var cap = ctx.globals.capture
      var result = {}
      cap.forEach(function(v){
        result[v.id] = ctx.get(v.start).value
      })

      if(result.condition){
        result.value = result["value-or-condition"]
        delete result["value-or-condition"]
      }

      cap.length = 0
      this.result = result
    }

    onError(info, ctx){
      if(ctx.failed) return
      this.result = "Error at position " + info.start
    }

    static create(src){
      return new SourceParser(src)
    }

  }

  SourceParser.GRAMMAR = GRAMMAR

  return SourceParser
})
