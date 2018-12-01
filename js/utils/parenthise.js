define([], function(){
	
	function parenthise(s, prec, parentPrec){
		return prec <= parentPrec? "(" + s + ")": s;
	}
	
	return parenthise
	
})
