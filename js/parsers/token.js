define(function(){

  class Token{
    constructor(id, start, end, ctx){
      this.id = id
      this.start = start
      this.end = end
      this.ctx = ctx
    }

    get value(){
      if(!this._value){
        this._value = this.ctx.slice(this.start, this.end)
      }
      return this._value
    }

    isa(typename){
      return ("" + this.id).toLoweCase() === ("" + typename).toLoweCase()
    }

    equals(v){
      return this.value === v
    }

    toString(){
      return this.id + " @(" + this.start + ", " + this.end + ")"
    }

    static create(id, start, end, ctx){
      return new Token(id, start, end, ctx)
    }
  }

  return Token

})
