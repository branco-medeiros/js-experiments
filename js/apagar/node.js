define([], function(){

  class Node{

    constructor(parent, value){
      this.parent = parent
      this.children = [];
      if(value) Object.assign(this, value)
    }

    reparent(other){
      other.replace(this)
      this.parent = other;
      other.children.push(this)
      return this
    }

    replace(other){
      var p = other.parent
      if(p){
        var idx = p.children.indexOf(other)
        if(idx >= 0) p.children[idx] = this
      }
      this.parent = p
      other.parent = null
      return this
    }

    addTo(parent){
      this.parent = parent;
      parent.children.push(this)
      return this
    }


    display(lvl){
      var result = ""
      lvl = ~~lvl || 1
      var spc = (new Array(lvl + 1)).join("  ")
      for(var k in this){
        if(k === "parent" || k === "children") continue
        if(this.hasOwnProperty(k)){
          var v = this[k]
          result += spc + k + ":" + (v.display? v.display(): ("" + v)) + "\r\n"
        }
      }

      if(this.children.length){
        var nlvl = lvl + 1
        result += spc + "children: " + this.children.length + "\r\n"
        result += this.children.map(function(n, i){
          return spc + "  --" + lvl + "." + (i + 1) + "\r\n" + n.display(nlvl)
        }).join("\r\n")
      }

      return result
    }
  }

  Node.create = function(...args){
    return new Node(...args)
  }

  return Node
})
