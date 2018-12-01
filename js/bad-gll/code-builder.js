define(["gll/op-kind"], function(Kind){

  class Builder{


    static split(program, pos){
      program.push({kind:Kind.SPLIT, position: pos})
      return Builder
    }

    static call(program, rule){
      program.push({kind:Kind.CALL, rule:rule})
      return Builder
    }

    static ret(program){
      program.push({kind:Kind.RET})
      return Builder
    }

    static goto(program, pos){
      program.push({kind:Kind.GOTO, position: pos})
      return Builder
    }

    static match(program, value){
      program.push({kind:Kind.MATCH, value: value})
      return Builder
    }

    static succeed(program){
      program.push({kind:Kind.SUCCEED})
      return Builder
    }

    static fail(program){
      program.push({kind:Kind.FAIL})
      return Builder
    }

    static fn(program, fn){
      program.push({kind:Kind.FN, fn: fn})
      return Builder
    }
  }

  return Builder

})
