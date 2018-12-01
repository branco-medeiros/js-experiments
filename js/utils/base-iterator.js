define(
["./it-printer"],
function(show){
	
	function iterator(getter){
		this.getter = getter;
		this.position = 0;
		this.done = false;
		this.cache = [];
	}
	
	iterator.prototype.moveNext = MoveNext;
	iterator.prototype.slice = Slice;
	iterator.prototype.at = GetAt;
	iterator.prototype.assign = Assign;
	iterator.prototype.clone = Clone;
	Object.defineProperty(iterator.prototype, "count", {get:GetCount});
	Object.defineProperty(iterator.prototype, "current", {get:GetCurrent});
	Object.defineProperty(iterator.prototype, "finished", {get:GetFinished});
	
	
  iterator.prototype.show = function(){
		return show(this);
	}
	
  iterator.prototype.toString = function(){
  	return show(this, '');
  }
	
	
  function GetAt(pos){
  	return TryGet.call(this, pos)
  }
  
  
	function TryGet(pos){
		var c = this.cache;
		if(!this.done) {
			var p = pos + 1 - c.length
			while(p > 0){
				var v = this.getter();
				if(v === undefined){
					this.done = true;
					break;
				}
				c.push(v);
				p -= 1;
			}
		}
		return c[pos]
	}
	
	function GetCurrent(){
		return this.at(this.position);
	}
	
	
	function GetCount(){
		var c = this.cache;
		while(!this.done){
			TryGet.call(this, c.length + 1000);
		}
		return c.length;
	}
	
	function GetFinished(){
		return this.at(this.position) === undefined;
	}
	
	function MoveNext(){
		if(!this.finished){
			this.position += 1;
			return !this.finished
		}
		return false;
	}
	
	
	function Slice(p, size){
		var last = size == null? this.position: p + size
		if(last <= p) return undefined
		TryGet.call(this, last); 
		return this.cache.slice(p, last)
	}
	
	
	function Assign(value){
		if(value instanceof iterator){
			this.position = value.position;
		}
	}
	
	function Clone(){
		throw new Error("clone not implemented");
	}
	
	return iterator
	
})