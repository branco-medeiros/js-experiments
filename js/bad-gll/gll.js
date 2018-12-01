define(["gll/op-kind", "gll/frame"],
function(Kind, Frame){


  class Gll{

    constructor(){
      this.leftRecursiveCalls = []
    }

    run(program, input){
      this.leftRecursiveCalls = []
      this.errors = []
      this.result = null
      this.stopPosition = 0
      this.maxThreadCount = 0
      this.inputPeakPos = -1

      var thread = new Thread()
      var prog = [{kind: Kind.CALL, rule: program}]
      thread.ip.source = prog
      thread.input.source = input
      var threads = [thread]
      var count = 0;
      while(threads && threads.length){
        threads = this.step(threads)
        count += 1
      }
      this.stopPosition = count
      return count === input.length
    }

    step(threads){
      var matches = []
      if(!(threads && threads.length)) return matches

      var i = 0;
      while(i < threads.length){
        var thread = threads[i]
        i+= 1

        while(thread){
          var op = thread.ip.current
          switch(op.kind){
            case Kind.CALL:
              var rule = op.rule
              if( thread.alreadyCalled(rule)){
                //saves thread as a left recursive call
                //...
                var lrc = this.leftRecursiveCalls
                var callFrame = thread.callTo(rule)
                if(!lrc.find((v) => callFrame.matches(v)))){
                  callFrame.thread = thread
                  lrc.push(callFrame)
                }

                thread = null

              } else {
                thread.call(rule)
              }
              break;

            case Kind.RET:
              var rule = thread.ip.source
              var lrc = this.leftRecursiveCalls;
              lrc.filter((v) => v.to === rule).forEach(function(frame){
                //return all
              })
              thread.ret()
              break;

            case Kind.MATCH:
              var value = op.value
              if(thread.input.matches(value)){
                thread.input.moveNext()
                thread.freeJump = true
                thread.ip.moveNext()
                matches.push(thread)
              }
              thread = null;
              break;

            case Kind.SPLIT:
              var pos = instr.position
              if(pos <= thread.ip.pos){
                throw new Error("Invalid split address")
              }
              var t = thread.clone()
              t.ip.pos = pos
              threads.push(t)
              thread.ip.moveNext()
              break;

            case Kind.GOTO:
              var pos = instr.position
              if(pos <= thread.ip.pos){
                if(thread.freeJump){
                  thread.ip.pos = pos
                  thread.freeJump = false
                } else {
                  thread.error = "Invalid goto address"
                  this.errors.push(thread)
                  thread = null
                }
              } else {
                thread.ip.pos = pos
              }
              break;

            case Kind.SUCCESS:
              //process SUCCESS
              thread = null;
              break;

            case Kind.FAIL:
              //process failure
              thread = null
              break;

            case Kind.FN:
              var fn = op.fn
              if(!(fn instanceof Function)) throw new Error("Invalid fn")
              if(!fn(thread) {
                thread = null
              } else {
                thread.ip.moveNext()
              }
              break;

            default:
              thread.error = "Invalid instruction"
              this.errors.push(thread)
              thread = null
          }
        }
      } //while(thread)
    } //while(i...)
    if(threads.length > this.maxThreadCount){
      this.maxThreadCount = threads.length
      this.inputPeakPos = threads[0].input.pos
    }
    return matches


  }

  return Gll

})
