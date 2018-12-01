define(
[],
function(){
	function compare(v1, v2){
		var notv1 = v1 === null || v1 === undefined;
		var notv2 = v2 === null || v2 === undefined;
		if( notv1 && notv2) return 0;
		if(notv1) return -1;
		if(notv2) return 1;
		if(v1.compare) return v1.compare(v2);
		if(v2.compare) return -v2.compare(v1);
		return v1 < v2? -1: (v1 > v2? 1: 0) 
	}
	
	function BinarySearch(src, value, cp){
		cp = cp || compare;
		var result = {found:false, index:0}
    var min = 0;
    var max = src.length - 1;
    var pos = 0;
  
    var el = null;
    while (min <= max) {
			pos = (min + max) >> 1;
	
			var v = cp(src[pos], value);
			
			switch(v){
			case -1:
				min = pos + 1;
				break;
			case 1:
				max = pos - 1;
				break;
			default:
				result.index = pos
				result.found = true;
				return result;
			}
    }
		result.index = min
    return result;
	}
	
	return BinarySearch
})

