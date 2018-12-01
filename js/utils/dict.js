//A dict is basically list that can be accessed both by index or by key
//items must have a getKey method that returns a string
define([], function(){
	
	function getKey(v){
		if(v === null || v === undefined) throw "Invalid object";
		if(v.key) return v.key;
		var k = (v.getKey && v.getKey());
		if(!k) throw "Item has no key";
		return k
	}
	
	function dict(){
		var self = this;
		
		self.items = [];
		self.keys = {}
		
		self.add = function(v){
			var k = getKey(v);
			var i = self.indexOfKey(k);
			if(i >= 0){
				self.items[i] = v;
				self.keys[k] =v;
			} else {
				self.items.push(v);
				self.keys[k] = v;
			}
			return v;
		}
		
		
		
		self.removeAt = function(i){
			if(i < 0 || i >= self.items.length) return false;
			var v = self.items[i];
			self.items.splice(i, 1);
			delete self.keys[getKey(v)];
			return true;
		}
		
		self.removeByKey = function(k){
			return self.removeAt(self.indexOfKey(k));
		}
		
		self.indexOf = function(v){
			return self.items.indexOf(v);
		}
		
		self.indexOfKey = function(k){
			var v = self.itemByKey(k);
			return (!!v)? self.items.indexOf(v): -1;
		}
		
		self.item = function(i){
			return self.items[i]
		}
		
		self.itemByKey = function(k){
			return self.keys[k]
		}
		
		self.getCount = function(){
			return self.items.length;
		}
		
		self.forEach = function(f){
			for(var i=0, max = self.items.length; i < max; ++i){
				var r = f(self.items[i], i);
				if(r === false) break;
			}
		}
	}
	

	return dict;
	
})