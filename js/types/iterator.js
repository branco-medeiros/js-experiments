define(["types/list"],
function(List){

  class Iterator extends List{
    constructor(source){
      super(source)
      this._pos = 0
    }

    get position(){
      return this._pos
    }

    set position(v){
      this._pos = v
    }

    get current(){
      return this.get(this.position)
    }

    get finished(){
      //we try not to use this.length so to not force a full read
      //of an eventual lazy list
			return this.position >= 0 && this.current === undefined;
		}

    setPosition(value){
      this.position = value
      return this
    }

    moveNext(){
      if(!this.finished){
        this.position += 1
        return this
      }
      return false
    }

    matchesAt(pos, v){
			var v2 = this.at(pos)

			return v != null && v2 != null &&
				(
					(v === v2 ) ||
          (v instanceof Function && v(v2))
					(v.equals && v.equals(v2)) ||
					(v2.equals && v2.equals(v))
				)
		}

		matches(v){
			return this.matchesAt(this.position)
		}


    clone(){
      return new Iterator().assign(this)
    }

    assign(other){
      if(other instanceof Iterator){
        super.assign(other)
        this._pos = other._pos
      }
      return this
    }
  }

  return Iterator

})
