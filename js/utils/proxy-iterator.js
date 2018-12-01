define(
["./base-iterator"],
function(base){
	
	function getter(){}
	
	function iterator(other){
		if(!(other instanceof base)) throw new Error("Invalid parameter")
		base.call(this, getter);
		this._other = other;
	}

	iterator.prototype = Object.create(base.prototype);
	iterator.prototype.constructor = iterator;
	
	iterator.prototype.slice = Slice;
	iterator.prototype.at = GetAt;
	iterator.prototype.clone = Clone;
	Object.defineProperty(iterator.prototype, "count", {get:GetCount});
	
	function GetAt(pos){
		return this._other.at(pos);
	}
	
	function Slice(start, size){
		return this._other.slice(start, (size == null? this.position-start:size))
	}
	
	function GetCount(){
		return this._other.count;
	}
	
	function Clone(){
		var r = new iterator(this._other);
		r.position = this.position;
		return r;
	}
		
	return iterator
	
})