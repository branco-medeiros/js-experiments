define(
[], 
function(){
	
	function NoCaseEquals(v1, v2){
		return String(v1 == null ? "" : v1).toUpperCase() === String(v2 == null ? "" : v2).toUpperCase()
	}
	
	
	return NoCaseEquals

})