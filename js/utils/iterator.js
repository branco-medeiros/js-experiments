define(
["./base-iterator"],
function(base, show){
	
	var getter = function(){}
	
	function iterator(list){
		base.call(this, getter);
		this.done = true;
		if(list == null) list = [];
		if(list.length === undefined) list = [list];
		this.cache = list;
	}

	iterator.prototype = Object.create(base.prototype);
	iterator.prototype.constructor = iterator;
	
	Object.defineProperty(iterator.prototype, "source", {get: function(){return this.cache}})
	iterator.prototype.clone = Clone;
	
	
	function Clone(){
		var r = new iterator(this.cache);
		r.position = this.position;
		return r;
	}
	
  iterator.from = function(v){
  	if(v instanceof base) return v;
  	return new iterator(v);
  }
  
	return iterator
	
})