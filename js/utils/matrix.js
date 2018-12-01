define(
[],
function(){


	function zero(){
		return 0
	}
	
	function matrix(rows, cols, mapFn){
		var self = this;
		mapFn = mapFn || zero
		var r = [];
		for(var i=0; i < rows; ++i){
			var l = [];
			for(var j=0; j < cols; ++j){
				l.push(mapFn(i, j))
			}
			r.push(l)
		}
		
		this.data = r;
		this.rows = rows;
		this.cols = cols;
		
		this.set = function(row, col, value){
			self.data[row][col] = value;
		}
		
		this.get = function(row, col){
			return self.data[row][col];
		}
		
		this.apply = function(fn){
			for(var i=0; i < self.rows; ++i){
				var r = self.data[i];
				for(var j =0; j < self.cols; ++i){
					r[j] = fn(r[j], i, j)
				}
			}
			return self
		}
		
		this.dup = function(){
			return new matrix(self.rows, self.cols, function(r, c){
				return self.get(r, c)
			})
		}
		
		this.transpose = function(){
			return new matrix(self.cols, self.rows, function(r, c){
				return self.get(c, r)
			})
		}
		
		this.mult = function(value){
			if(value.constructor === matrix){
				var n = Math.min(self.cols, value.rows)
				var m = new matrix(self.rows, value.cols, function(row, col){
					var s = 0; 
					for(var k = 0; k < n; ++k){
						s = s + self.get(row, k) * value.get(k, col)
					}
					return s
				});
				return m;
			}
			
			var r = new matrix(self.rows, self.cols, function(row, col){
				return value * self.get(row, col)
			});
			return r;
		}
		
		this.mapReduce = function(mapFn, reduceFn){
			var prev = undefined;
			for(var i =0; i < self.rows; ++i){
				var n = [];
				var r = self.data[i]
				for(var j = 0; j < self.cols; ++j){
					var v = mapFn(r[j], i, j);
					n.push(v)
				}
				prev = reduceFn(n, i, prev)
			}
			return prev;
		}
		
		this.getRow = function(n){
			return self.data[n].slice(0)
		}

	}
	
	matrix.fromTable = function(t){
		var rows = t.length || 1;
		var cols = (t[0] && t[0].length) || 1;
		return  new matrix(rows, col, function(r, c){
			return t[r][c]
		})
		
	}
	
	return matrix;

});
