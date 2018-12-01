define(["types/list", "types/iterator"],
function(List, Iterator){

  class ListIterator extends Iterator{
    constructor(source){
      super(null)
      this.source = source
    }

    set source(value){
      if(value && !(value instanceof List)) throw new Error("Source must be a List")
      this._source = value
    }

    get(pos){
      return this._source && this._source.get(pos)
    }

    clone(){
      return new ListIterator().assign(this)
    }

    assign(other){
      if(other instanceof Iterator){
        super.assign(other)
        if(!(other instanceof ListIterator)){
          this.source = other
        }
      }
      return this
    }

    static create(value){
      return new ListIterator(value)
    }
  }

  return ListIterator
})
