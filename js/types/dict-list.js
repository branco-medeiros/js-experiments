define([], function(){

  function getId(v){
    if(v == null) return null
    return v.id
  }

  class DictList{


    constructor(idGetter){
      this._idGetter = idGetter || getId
    }

    get itens(){
      if(!this._itens) this._itens = []
      return this._itens
    }

    get dict(){
      if(!this._dict) this._dict = {}
    }

    getId(value){
      return this._idGetter(value)
    }

    add(value){
      var id = this.getId(value);
      var dict = this.dict
      var itens = dict[id]
      if(!itens){
        itens = []
        dict[id] = itens
      }
      itens.push(value)
      this.itens.push(value)
      return this;
    }

    getFirst(id){
      return (this.dict[id] || [])[0]
    }

    getLast(id){
      var v = this.dict[id] || []
      return v[v.length -1]
    }

    getAll(id){
      return this.dict[id] || []
    }

    remove(value){
      var all = this.getAll(this.getId(value));
      all.remove(value)
      this.itens.remove(value)
      return this;
    }
  }

})
