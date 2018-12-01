define(
["./base-iterator", "./proxy-iterator"],
function(base, proxy){
	
	function iterator(getter){
		base.call(this, getter);
	}

	iterator.prototype = Object.create(base.prototype);
	iterator.prototype.constructor = iterator;
	
	iterator.prototype.clone = Clone;
	
	
	function Clone(){
		var r = new proxy(this);
		r.position = this.position;
		return r;
	}
	
	return iterator
	
})