define(["types/list"],
function(List){

  class EnumList extends List{
    constructor(source){
      super(null)
      this.source = source
    }

    set source(value){
      if(value && !value.next) throw new Error("value must have a .next method")
      this._value = value;
      this._source = []
    }

    get length(){
      while(this.get(this._source.length) !== undefined){
        //does nothing
      }
      return this._source.length
    }

    get(pos){
      pos = ~~pos
      var max = this._source.length
      if(pos >= max) {
        while(true){
          var v = this._value.next()
          if(!v || v.done) break;
          this._source.push(v.value)
          max += 1
          if(max > pos) break
        }
      }
      return this._source[pos]
    }

    assign(value){
      if(value instanceof List){
        this.source = value[Symbol.iterator]()
      }
      return this;
    }

    clone(){
      return new List(this)
    }

    static create(source){
      return new EnumList(source)
    }
  }

  return EnumList

})
