define([], function(){
	
	function Tree(id, value){
			this.id = id;
			this.value = value;
		}
		
		Tree.prototype = new Array();
		
		Tree.prototype.value = undefined;
		Tree.prototype.isResult = false;
		Tree.prototype.named = TreeNamed;
		Tree.prototype.get = TreeGet;
		Tree.prototype.getValue = TreeGetValue
		Tree.prototype.traverse = TreeTraverse;
		Tree.prototype.iterate = TreeIterate;
		Tree.prototype.print = TreePrint
		Tree.prototype.toString = TreeToString;
		
		Object.defineProperty(Tree.prototype, 'collapsible', {get:TreeIsCollapsible});
		Object.defineProperty(Tree.prototype, 'empty', {get:TreeIsEmpty});
		Object.defineProperty(Tree.prototype, 'annonymous', {get:TreeIsAnnonymous});
	
		function display(item){
			var r;
			if(item instanceof Tree){
				r = (item.id == null? "": item.id) 
					+ ":" 
					+ (item.value == null? "": item.value)
			} else if(item != null) {
				r = item + "";
			} else {
				r = ""
			}
			return r;
		}
		function TreeNamed(name){
			return String(this.id).toLowerCase() === String(name).toLowerCase();
		}
		
		function TreeIsCollapsible(){
			return this.annonymous && this.length == 1;
		}
		
		function TreeIsAnnonymous(){
			return this.id == null && this.value == null;
		}
		
		function TreeIsEmpty(){
			return this.annonymous && this.length == 0;
		}
		
		function TreeToString(){
			return this.traverse(null, {}, TreeTraverseToString).result;
		}
		
		function TreePrint(ident){
			return this.traverse(nul, {}, TreeTraversePrint).result;
		}
		
		function TreeTraverseToString(it, ctx, sender, enter, leave, index){
			if(enter){
				var comma = index? ", " : "";
				var r = display(this)
				var bracket = sender instanceof Tree? "[" : "";
				
				ctx.result = (ctx.result || "") + comma + r + bracket;
			}
			
			if(leave && sender instanceof Tree){
				ctx.result += "]"
			}
		}
		
		function TreeTraversePrint(it, ctx, sender, enter, leave, index){
			ctx.level = Number(ctx.level) || 0;
			if(enter){
				var r = display(sender);
				
				var spc = [];
				spc.length = ctx.level + 1;
				spc = spc.join("  ");
				
				var nl = ctx.result? "\r\n" : ""
					
				ctx.result = (ctx.result || "") + nl + spc + r;
				ctx.level += 1;
					
			} 
			
			if(leave){
				ctx.level -= ctx.level > 0? 1: 0;
			}
			
		}
		
		function TreeGet(index){
			if(index == null) return undefined;
	
			//if a list of arguments was passed, convert to array
			if(arguments.length > 1){
				return this.get.call(this, arguments)
			}
			
			var self = this;
			
			//returns the first child (column wise) named by index
			if(index.constructor === String){
				return this.iterate(null, {}, function(it, ctx, v){
					if(v === self) return;
					if(v && v.named && v.named(index)){
						ctx.result = v;
						return false;
					}
				}).result;
			}
			
			//returns the nth item
			if(index.constructor === Number){
				return self[index];
			}
	
			//if index is array, gets each item, in order
			if(index.length){
				var v = self;
				for(var i=0, max=index.length; i < max; ++i){
					if(!(v instanceof Tree)) return undefined
					v = v.get(index(i));
				}
				return v;
			}
			
			//converts the index to string and gets it
			return self.get(String(index));
			
		}
		
		function TreeGetValue(){
			return this.iterate(null, {}, function(it, ctx, v, enter){
				if(enter){
					if(v instanceof Tree) v = v.value
					if(v != null){
						ctx.result = v;
						return false
					}
				}
			}).result;
		}
	
		function TreeTraverse(it, ctx, builder){
			//depth-first traversal
			builder = builder || (ctx && ctx.builder)
			if(!builder) return;
	
			var stack = [{item:this, done:false, idx:0}];
			
			while(stack.length){
				var s = stack[stack.length - 1];
				var v = s.item;
				var enter = !s.done;
				var leave = !enter;
				s.done=true;
				
				var hasItems = enter && v instanceof Tree && v.length;
				if(!hasItems){
					leave = true;
					stack.pop();
				}
				var r = builder(it, ctx, v, enter, leave, s.idx);
				if(r === false) break;
				
				if(hasItems){
					for(var i=v.length-1; i>=0;--i){
						stack.push({item:v[i], done:false, idx:i})
					}
				}
			}
			return ctx;
		}
		
		
		function TreeIterate(it, ctx, builder){
		//breadth first traversal
			builder = builder || (ctx && ctx.builder)
			if(!builder) return;
			
			var stack = [this];
			while(stack.length){
				var v = stack.shift();
				
				var r = builder(it, ctx, v, true, true);
				if(r === false) break;
				if(v instanceof Tree){
					for(var i=0, max= v.length; i < a; ++i){
						stack.push(v[i]);
					}
				}
			}
			return ctx;
		}

		return Tree;
});
