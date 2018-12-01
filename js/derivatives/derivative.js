define([], function(){

  var NUL = new Nul()
  var EPS = new Eps()

  class Matcher{

    nullable(){
      return true
    }

    derive(v){
      return NUL
    }

    flatten(){
      return [this]
    }

    static makeAlt
  }


  class Nul extends Matcher{
    constructor(){
      super()
    }

    nullable(){
      return false
    }
  }

  class Eps extends Matcher{
    constructor(){
      super()
    }

    derive(){
      return EPS
    }
  }


  class PairMatcher extends Matcher{
    constructor(left, right){
      if(!(left instanceof Matcher)) throw new Error("Invalid left")
      if(!(right instanceof Matcher)) throw new Error("Invalid right")

      this._left = left;
      this._right = right;
    }

    get left(){
      return this._left
    }

    get right(){
      return this._right
    }

    flatten(){
      return this.left.flatten().push(...this.right.flatten())
    }
  }

  class And extends PairMatcher{
    constructor(left, right){
      super(left, right)
    }

    nullable(){
      return this.left.nullable() && this.right.nullable()
    }

    derive(v){
      var res = new And(this.left.derive(v), this.right)
      return this.left.nullable()
        ? Matcher.makeAlt(res, this.right.derive(v))
    }
  }

  class Or extends PairMatcher{
    constructor(left, right){
      super(left, right)
    }

    nullable(){
      return this.left.nullable() || this.right.nullable()
    }

    derive(v){
      return Matcher.makeAlt(this.left.derive(v), this.right.derive(v))
    }
  }

  class ValueMatcher{
    constructor(value){
      if(!(value instanceof Matcher)) throw new Error("Invalid parameter")
      this._value = value
    }

    get value(){
      return this._value
    }
  }

  class Star extends ValueMatcher{
    constructor(value){
      super(value)
    }

    nullable(){
      return true
    }

    derive(v){
      return new And(this.value.derive(v), this)
    }

  }

  class Lit extends Matcher{
    super(v){
      if(v == null) throw new Error("Invalid parameter")
      super()
      this._value = v
    }

    get value(){
      return this._value
    }

    nullable(){
      return false
    }

    matches(v){
      if(v == null) return false
      var v2 = this.value
      return v2 === v ||
        (v2.equals && v2.equals(v)) ||
        (v.equals && v.equals(v2)) ||
        v2 == v
    }

    derive(v){
      return this.matches(v)? EPS: NUL
    }
  }

  class Edge{
    constructor(from, tag, to){
      this.from = from;
      this.to = to;
      this.tag = tag;
    }

    static create(from, tag, to){
      return new Edge(from, tag, to)
    }
  }

  class StateMap{
    constructor(states, edges){
      this.states = states;
      this.edges = edges;
    }

    static create(states, edges){
      return new StateMap(states, edges)
    }
  }

  class Dfa{
    constructor(states, start, acceptinh, edges){
      this.states = states; //list of states
      this.start = start; //the start state
      this.accepting = accepting; //list accepting states
      this.edges = edges //list edge mapping
    }

    create(start, alphabet){

      function explore(statemap, state){
        alphabet.forEach(function(v){
          goto(state, statemap, c)
        })
        return statemap
      }

      function goto(state, statemap, match){
        var sm = state.derive(match)
        if(statemap.states.indexOf(sm) >= 0){
          statemap.edges.push(Edge.create(state, match, sm))
        }
      }

    }


  }

})
