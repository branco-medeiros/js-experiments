define([], function(){

	class Node{
		constructor(prev, value){
			this.prev = prev;
			this.value = value;
			this.index = prev? prev.index + 1: 0;
		}

		assign(other){
			this.prev = other.prev;
			this.value = other.value;
			this.index = other.index;
			return this;
		}

	}


	class Track{

		constructor(other){
			this.node = null
			if(other != null){
				if(other instanceof track){
					this.node = new Node().assign(other.node)
				} else{
					this.node = new Node(null, other)
				}
			}
		}

		get index(){
			return this.node? this.node.index : -1;
		}

		get value(){
			return this.node? this.node.value : undefined;
		}


		push(value){
			this.node = new Node(this.node, value)
			return this;
		}

		peek(index){
			var n = this.getNode(index)
			return n? n.value: undefined
		}

		pop(index){
			var n = this.getNode(index)
			this.node = n? n.prev: null
			return n? n.value: null;
		}

		getNode(index){
			index = index || 0
			var idx = this.index
			index = (index < 0? idx + 1 : 0) + index
			if(index > idx || index < 0) return null;
			var n = null
			this.eachNode(function(v){
				if(!index){
					n = v;
					return true;
				}
				index -= 1
			})
			return n;
		}

		eachNode(fn){
			var c = this.node;
			while(c){
				if(fn(c)) break;
				c = c.prev;
			}
		}

		each(fn){
			this.eachNode(function(v){
				return fn(v.value, v.index)
			})
		}


		clone(){
			return new Track(this);
		}

	} //track

	return Track

});
