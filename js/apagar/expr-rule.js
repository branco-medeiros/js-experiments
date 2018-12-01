define(["peg/rule", "peg/peg", "types/context"],
function(Rule, peg, Context){

  class ExprRule extends Rule{

    constructor(name, value, prefix, infix){
      super(name, value);
      this.prefix = prefix || []
      this.infix = infix || []
    }

    match(ctx, prec, ...args){
      var cur = this.getRuleInfo(ctx);
      var parent = cur.parent;
      this.notifyEnter(cur, ctx);

      ctx.globals.rule = cur;

      ctx.globals.rule = parent

      if(ctx.accepted){
        parent.children.push(cur)
        this.notifyMatch(cur, ctx)
      }

      this.notifyLeave(cur, ctx)

      return ctx;
    }

  }

})
