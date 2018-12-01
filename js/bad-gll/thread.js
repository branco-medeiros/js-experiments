define(["gll/frame"],
function(Frame){


  class Thread{

    constructor(other){
      if(other){
        if(!(other instanceof Thread)) throw new Error("Invalid parameter")
        this.stack = other.stack.clone()
        this.ip = other.ip.clone()
        this.input = other.input.clone()
        this.error = other.error
      } else {
        this.stack = new Track();
        this.ip = new Iterator()
        this.input = new Iterator()
      }
    }

    clone(){
      return new Iterator(this)
    }

    goto(rule){
      this.ip.source = rule
      this.ip.pos = 0
      return this
    }

    call(rule){
      var frame = callTo(rule)
      this.stack.push(frame)
      return this.goto(rule)
    }

    ret(){
      var frame = this.stack.pop()
      this.ip.source = frame.from
      this.ip.pos = frame.ip
      this.ip.moveNext()
      return this
    }

    callTo(rule){
      return Frame.fromThread(this, rule)
    }

    alreadyCalled(rule){
      var pos = this.input.pos
      return this.stack.find((v) => v.rule === rule && v.pos === pos)
    }
  }

  return Thread
})
