define(["types/track", "types/iterator", "types/node"],
function(Track, Iterator, Node){

	class Context extends Iterator{

		constructor(other){
			super(other)
			if(other instanceof Context){
				this.assign(other)
			} else {
				this._vars = {_result: new Track({start:0, children:[]})}
			}
		}

		////////////////////////////////////////////////////////////////////////////
		//// accept, reject

		get accepted(){
			return !this.failed;
		}

		set accepted(value){
			this.failed = !value;
		}


		fail(){
			this.failed = true;
			return this;
		}

		accept(){
			this.failed = false;
			return this;
		}

		sliceFrom(start){
			return this.slice(start, this.position)
		}

		////////////////////////////////////////////////////////////////////////////
		//// globals

		get globals(){
			return this._vars
		}

		get result(){
			return this._vars._result;
		}

		peek(){
			return this.result.peek()
		}

		pop(){
			return this.result.pop()
		}

		push(value){
			this.result.push(value)
			return this
		}

		swap(v){
			var ret = this.pop()
			this.push(v)
			return ret
		}

		swapRule(value){
		  var ret = this.pop()
			this.pushRule(value)
			return ret
		}

		pushRule(value){
			this.push({rule:rule, start:this.position, children:[]})
			return this
		}

		get children(){
			return this.peek().children
		}

		popAsChild(ok){
			var v = this.pop()
			if(ok) this.children.push(v)
		}

		////////////////////////////////////////////////////////////////////////////
		//// clone, assign...

		assign(other){
			if(other instanceof Context){
				super.assign(other)
				this.failed = other.failed
				this._vars = other.globals
			}
			return this
		}

		clone(){
			return new Context(this);
		}

		toString(){
			var result = "";
			var pos = this.position
			var len = this.length

			if(len === 0){
				result = "[]";

			} else if(pos < 0) {
				result = "[]" + this.slice(0).toString()

			} else if(pos >= len){
				result = this.slice(0).toString() + "[]"

			} else if(pos == 0) {
				result = "[" + this.get(0) + "]" + this.slice(1)

			} else {
				result = this.slice(0, pos) + "[" + this.current + "]" + this.slice(pos+1);
			}

			return result;
		}

		static from(value){
			if(value instanceof Context) return value;
			return new Context(value);
		}

		static create(value){
			return new Context(value)
		}

	}


	return Context

})
