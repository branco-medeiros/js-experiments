define([], function(){

  //specifies a parsing forest;
  //the parsing forest represnts a list of valid alternatives
  //a fores encompasses several parse-trees that diverge at some
  //point. a give node represent a list of alternatives (at least one)
  //

  class Node{
    constructor(parent){
      this._parent = parent
    }

    get parent(){
      return this._parent
    }

    get limits(){
      if(!this._limits) this._limits = []
      return this._limits
    }

    set limits(start, end){
      var v = this.limits;
      if(start != null) v[0] = ~~start
      if(end != null) v[1] = ~~end
    }

    get start(){
      return this.limits[0]
    }

    set start(v){
      this.limits[0] = ~~v
    }

    get end(){
      return this.limits[1]
    }

    set end(v){
      this.limits[1] = ~~v
    }
  }

  class ListNode extends Node{
    constructor(parent){
      super(parent)
    }

    get children(){
      if(this._children == null) this._children = []
      return this._children
    }

    add(n){
      if(!(n instanceof Node)) throw new Error("Invalid parameter")
      if(n.parent !== this) throw new Error("Invalid parent")
      this.chldren.push(n)
    }

  }

  class Seq extends ListNode{
    constructor(parent){
      super(parent)
    }
  }


  class Alt extends ListNode{
    constructor(parent){
      super(parent);
    }
  }

  class Ref extends ListNode{
    constructor(parent, value){
      super(parent);
      this._value = value
    }

    get value(){
      return this._value
    }

    get body(){
      return this._body
    }

    set body(value){
      this._body = value;
    }
  }




})
