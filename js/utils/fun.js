define([], function(){

	function fun(f){
		if(typeof(f) == "function"){
			var a =[];
			if(arguments.length) a.push(...arguments)
			return function(){
				return f.apply(this, a)
			}
		}
		return function(){
			return f;
		}
	}

	return fun

})
