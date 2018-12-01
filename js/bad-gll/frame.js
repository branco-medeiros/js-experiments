define([], function(){

  class Frame{
    constructor(from, ip, pos, to){
      this.from = from
      this.ip = ip,
      this.pos = pos
      this.to = to

      this.$matches = this.matches.bind(this)
      this.$matchesCall = this.matchesCall.bind(this)
    }

    matches(v){
      if(v == null) return false
      if(v === this) return true
      return v.from === this.from &&
        v.to === this.to &&
        v.ip === this.ip &&
        v.pos === this.pos
    }

    matchesCall(v){
      if(v == null) return false
      if(v === this) return true
      return v.to === this.to &&
        v.pos === this.pos
    }

    matchesRule(v){
      if(v == null) return false
      return v === this.to
    }

    static fromThread(thread, to){
      return new Frame(
        thread.ip.source,
        thread.ip.pos,
        thread.input.pos,
        to
      )
    }
  }

  return Frame
})
