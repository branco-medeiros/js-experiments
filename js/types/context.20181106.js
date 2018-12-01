define(["types/track", "types/iterator"],
function(Track, Iterator){

	class Context extends Iterator{

		constructor(other){
			super(other)
			if(other instanceof Context){
				this.assign(other)
			} else {
				this._failed = false
			}
		}

		////////////////////////////////////////////////////////////////////////////
		//// accept, reject

		get failed(){
			return this._failed;
		}

		set failed(value){
			this._failed = !!value;
		}

		get accepted(){
			return !this._failed;
		}

		set accepted(value){
			this._failed = !value;
		}


		fail(){
			this._failed = true;
			return this;
		}

		accept(){
			this._failed = false;
			return this;
		}

		////////////////////////////////////////////////////////////////////////////
		//// status

		get status(){
			if(!this._status) this._status = {}
			return this._status
		}

		set status(obj){
			this._status = obj || {}
		}

		setStatus(obj){
			this.status = obj
			return this;
		}

		newStatus(){
			return this.setStatus({parent: this._status});
		}

		resolve(other){
			/***
				if other matched, loads its status as children
				of the current status, updates the current position
				and returns this;
				otherwise (other failed) returns other; if other is null, fails
			*/
			if(other && other.accepted){
				this.position = other.position

				var s = this.status;
				if(!s.children) s.children = []
				s.children.push(other.status)
				return this;
			}
			return other || this.failed();
		}

		////////////////////////////////////////////////////////////////////////////
		//// notification

		get listeners(){
			if(this._listeners == null) this._listeners = {}
			return this._listeners
		}

		set listeners(value){
			this._listeners = value
		}

		setListeners(value){
			this.listeners = value
			return this
		}

		notify(what, ...args){
			var list = this.listeners[what] || []
			for(var fn of list) fn(...args)
			return this;
		}

		addListener(what, fn){
			if(!fn || fn.constructor !== Function) throw new Error("Invalid parameter")
			var v = this.listeners[what]
			if(!v){
				v = []
				this.listeners[what] = v
			}
			v.push(fn)
			return this;
		}

		////////////////////////////////////////////////////////////////////////////
		//// other

		sliceFrom(start){
			return this.slice(start, this.position)
		}

		////////////////////////////////////////////////////////////////////////////
		//// globals

		get globals(){
			if(this._globals == null) this._globals = {}
			return this._globals
		}

		clearGlobals(){
			var v = this._globals
			if(v) for(var k in v) delete v[k]
			return this;
		}

		////////////////////////////////////////////////////////////////////////////
		//// vars

		get locals(){
			if(this._locals == null) this._locals = {};
			return this._locals
		}

		set locals(value){
			this._locals = value
		}

		setLocals(value){
			this.locals = value;
			return this;
		}

		setVar(id){
			var v = this.locals[id]
			if(v == null){
				v = new Track()
				this.locals[id] = v
			}
			return v
		}

		getVar(id){
			return this.locals[id]
		}

		dropVar(id){
			delete this.locals[id]
		}

		varPeek(id, index){
			var d = this.locals[id]
			return d? d.peek(index) : d;
		}

		varPop(id, index){
			var d = this.locals[id];
			return d? d.pop(index): null;
		}

		varPush(id, value){
			var d = this.locals[id];
			if(!d){
				d = new Track();
				this.locals[id] = d;
			}
			d.push(value)
			return this;
		}

		varEach(id, fn){
			var self = this;
			fn = fn || function(){}
			var d = this.locals[id]
			while(d){
				var r = fn(d.value, d.index, id, self);
				if(r) break;
				d = d.prev
			}
			return this;
		}

		////////////////////////////////////////////////////////////////////////////
		//// clone, assign...

		assign(other){
			if(other instanceof Context){
				super.assign(other)
				this._listeners = other.listeners
				this._failed = other.failed
				this._status = other.status
				this._locals = Object.assign({}, other.locals);
				this._globals = other.globals
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
