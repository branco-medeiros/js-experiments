define([], function(){

  class IteratorForList{
    constructor(value){
      this._list = value;
      this._last = null
      this._done = false
      this._pos = 0
    }

    next(){
      if(this._done) return {value:this._last, done:true}
      this._last = this.list.get(this._pos);
      this._pos += 1
      this._done = this._last = undefined
      return {value:this._last, done:this._done}
    }
  }

  class List{

    constructor(source){
      this._source = source;
      this[Symbol.iterator] = function(){
        return new IteratorForList(this)
      }
    }

    get source(){
      return this._source
    }

    set source(value){
      this._source = value
    }

    get length(){
      return (this._source && this._source.length) || 0
    }

    get max(){
      return this.length - 1
    }

    push(value){
      if(this._source) this._source.push(value)
      return this
    }

    pop(value){
      return this._source && this._source.pop(value)
    }

    get(pos){
      return this._source && (
        this._source.get instanceof Function
          ? this._source.get(pos)
          : this._source[pos]
      )
    }

    get last(){
      return this.get(this.max)
    }

    slice(first, last){
      if(this._source.slice) return this._source.slice(first, last)
      var result = []
      for(var i=first; i < last; ++i) result.push(this.get(i))
      return result
    }

    range(start, count){
      return this.slice(start, count? start + count : this.length)
    }

    forEach(fn){
      if(this._source.forEach) return this._source.forEach(fn)
      for(var i =0, max = this.length; i < max; ++i){
        fn(this.get(i), i, this)
      }
    }

    map(fn){
      if(this._source.map) return this._source.map(fn)
      var result = []
      for(var i =0, max = this.length; i < max; ++i){
        result.push(fn(this.get(i), i, this))
      }
      return result
    }

    filter(fn){
      if(this._source.filter) return this._source.filter(fn)
      var result = []
      for(var i =0, max = this.length; i < max; ++i){
        var item = get(i)
        if(fn(item, i, this)) result.push(item)
      }
      return result
    }

    find(fn){
      if(this._source.find) return this._source.find(fn)
      for(var i =0, max = this.length; i < max; ++i){
        var item = get(i)
        if(fn(item, i, this)) return item
      }
    }

    findIndex(fn){
      if(this._source.findIndex) return this._source.findIndex(fn)
      for(var i =0, max = this.length; i < max; ++i){
        var item = get(i)
        if(fn(item, i, this)) return i
      }
      return -1
    }

    reduce(fn, acc){
      if(this._source.reduce) return this._source.reduce(fn, acc)
      for(var i =0, max = this.length; i < max; ++i){
        acc = fn(acc, this.get(i), i, this)
      }
      return acc
    }


    clone(){
      return new List(this._source)
    }

    assign(other){
      if(other instanceof List){
        this._source = other._source
      }
      return this;
    }

    static create(value){
      return new List(value)
    }
  }

  return List
})
