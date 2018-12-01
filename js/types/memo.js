define([], function(){


  class Memo{
    constructor(data){
      if(data && !(data instanceof Array)) throw new Error("Invalid parameter")
      this.data = data || []
    }

    get(id, pos){
      var store = this.data[pos]
      if(store){
        var v = store[id];
        return v
      }
    }

    set(id, pos, value){
      var store = this.data[pos]
      if(!store){
        store = {}
        this.data[pos] = store;
      }
      store[id] = value;
      return value;
    }

    clear(){
      this.data = []
    }

    pos(value){
      return this.data[pos] || {}
    }

    getContents(){
      var result = {}
      this.data.forEach((p, i) => result[i] = p)
      return result
    }
  }

  return Memo
})
