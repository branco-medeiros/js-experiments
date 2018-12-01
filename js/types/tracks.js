define(["types/track"], function(Track){

  class Tracks {

    constructor(vars){
      this._vars = vars || {}
    }

    setVar(id){
			var v = this._vars[id]
			if(v == null){
				v = new Track()
				this._vars[id] = v
			}
			return v
		}

		getVar(id){
			return this._vars[id]
		}

		dropVar(id){
			delete this._vars[id]
		}

		varPeek(id, index){
			var d = this._vars[id]
			return d? d.peek(index) : d;
		}

		varPop(id, index){
			var d = this._vars[id];
			return d? d.pop(index): null;
		}

		varPush(id, value){
			var d = this._vars[id];
			if(!d){
				d = new Track();
				this._vars[id] = d;
			}
			d.push(value)
			return this;
		}

		varEach(id, fn){
			var self = this;
			fn = fn || function(){}
			var d = this._vars[id]
			while(d){
				var r = fn(d.value, d.index, id, self);
				if(r) break;
				d = d.prev
			}
			return this;
		}

    static create(vars){
      return new Tracks(vars)
    }
  }

  return Tracks
})
