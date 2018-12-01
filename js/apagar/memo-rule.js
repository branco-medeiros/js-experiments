define(["peg/rule", "types/memo"], function(Rule, Memo){

  var PENDING = -1;
  var ACCEPT = 1;
  var REJECT = 0;

  class MemoRule extends Rule{

    constructor(name){
      super(name);
    }

    getMemo(ctx){
      var m = ctx.globals.memo;
      if(!m) {
        m = new Memo();
        ctx.globals.memo = m
      }
      return m
    }

    /*
    notifyLeave(info, ctx){
      if(ctx.accepted){
        //corrects the rule hierarchy;
        //if it detects we are recursing, then the rule before this
        //is actually the first child of this rule
        var status = this.getMemo().get(this.name, info.start)
        if(status && status.recursion > 1){
          var prev = info.parent.children.splice(-2, 1)
          info.children.unshift(prev[0])
        }
      }
      super.notifyLeave(info, ctx)
    }
    */

    match(ctx, ...args){
      //console.log("<memo(" + this.name + " @ " + ctx.position + ")>")
      var memo = this.getMemo(ctx)
      var pos = ctx.position
      var result = memo.get(this.name, pos)
      if(!result){
        //first time entry
        //console.log("<first call...")
        result = {status:PENDING}
        memo.set(this.name, pos, result)
        ctx = super.match(ctx.clone(), ...args)
        //console.log("..." + (ctx.failed? REJECT : ACCEPT) + (result.recursion? " *recursion*": "") + ">")
        result.ctx = ctx
        result.status = ctx.failed? REJECT : ACCEPT;
        if(ctx.accepted && result.recursion){
          var stop = ctx.position
          while(true){
            result.recursion += 1
            if(result.recursion > ctx.length) throw new Error("bad recursion")
            ctx = super.match(ctx.clone().setPosition(pos), ...args)
            //checks if matched the memoed value
            if(ctx.position === stop) break;
            result.ctx = ctx
          }
        }

      } else if(result.status === PENDING){
        result.recursion = 1
        result.status = REJECT
        result.ctx = ctx.fail()
      }

      //returns cloned result on success to prevent alteration
      //of the current result
      return (result.status === ACCEPT)
        ? result.ctx.clone()
        : result.ctx;

    } //match


    fullDisplay(){
      return "%memo " + super.fullDisplay()
    }

    static create(name){
      return new MemoRule(name)
    }
  }//class

  return MemoRule

})
