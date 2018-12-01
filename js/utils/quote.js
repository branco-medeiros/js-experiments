define([], function(){
	function quote(v, q){
		q = q || "\""
		return q
			+ ("" + v).replace(/\t/g, "%tab")
				.replace(/\r/g, "%cr")
				.replace(/\n/g, "%lf")
			+ q;
	}
	return quote;
})
