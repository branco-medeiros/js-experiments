define(["./track"], function(Track){

	class Context{
		constructor(other){
			if(other == null){
				throw Error("missing parameter -- source or context")
			}
			if(other instanceof Context){
				this._source = other.source
				this._position = other.position
				this._failed = other._failed
				this._pending = other._pending
				this._vars = Object.assign({}, other._vars);

			} else {
				this._source = other;
				this._position = 0;
				this._failed = false
				this._pending = false
				this._vars = {};
			}
		}

		get source(){
			return this._source
		}

		get position(){
			return this._position;
		}

		set position(value){
			this._position = value;
		}

		get count(){
			return this._source.length;
		}

		get failed(){
			return this._failed;
		}

		set failed(value){
			this._failed = value;
		}

		get accepted(){
			return !this._failed;
		}

		set accepted(value){
			this._failed = !value;
		}

		get pending(){
			return this._pending;
		}

		set pending(value){
			this._pending = value;
		}

		get current() {
			return this.get(this._position)
		}

		get finished(){
			return this.position >= this..length;
		}

		moveNext(){
			if(!this.finished){
				this._position += 1;
				return true;
			}
			return false;
		}

		at(index){
			return this._source[index];
		}

		slice(start, finish){
			if(finish==null) finish = this._position;
			return this._source.slice(start, finish)
		}

		range(start, size){
			return slice(start, size == null? null : start + size)
		}

		getTag(id, create){
			var v = this._vars[id];
			if(!v && create){
				v = new Track();
				this._vars[id] = v;
			}
			return v
		}

		peek(id){
			var d = this._vars[id]
			return d? d.value : d;
		}

		pop(id){
			var d = this._vars[id];
			return d? d.pop(): null;
		}

		push(id, value){
			var d = this._vars[id];
			if(!d){
				d = new Track();
				this._vars[id] = d;
				d.value = value
			} else {
				d.push(value)
			}
			return this;
		}

		each(id, fn){
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

		assign(other){
			if(other && other instanceof Context){
				this._position = other._position;
				this._failed = other._failed
				this._pending = other._pending
				this._vars = Object.assign({}, other._vars);
			}
			return this
		}

		clone(){
			return new Context(this);
		}

		fail(){
			this._failed = true;
			return this;
		}

		accept(){
			this._failed = false;
			return this;
		}

		suspend(){
			this._pending = true;
			return this;
		}

		match(v1){
			var v2 = this.current;
			return  v2 != null
					 && v2 === v1
					 || v2.equals(v1)
					 || (v1 != null && v1.equals(v2))
		}


		toString(){
			var result = "";
			if(this.length == 0){
				result = "[]";

			} else if(this._position < 0) {
				result = "[]" + this._source

			} else if(this._position >= this.length){
				result = this._source + "[]"

			} else if(this._position == 0) {
				result = "[" + this.at(0) + "]" + this.slice(1, this.length)

			} else {
				result = this.slice(0) + "[" + this.current + "]" + this.slice(this.position+1, this.length);

			}

			return result;
		}
	}


	return Context

})
