define(
[],
function(){
	
	
	function escape(value){
		switch(value){
		case "\n": return "\\n";
		case "\r": return "\\r";
		case "\t": return "\\t";
		default:
			return value;
		}
	}
	
	function show(it, openQuote, closeQuote){
		var pos = it.position;
		var qt1 = openQuote == null? "'": openQuote;
		var qt2 = closeQuote ==null? (openQuote == null? "'": openQuote): closeQuote
		var r = [];
		var max = 5
		var p = pos;
		if(p < 0) {
			r.push("[]")
		}
		r.push(qt1);
		it.position = p - max;
		if(it.position > 0){
			r.push("...")
		} else {
			it.position = 0
		}

		while(it.position < p){
			r.push(escape(it.current));
			if(!it.moveNext()) break;
		}

		it.position = p;
		if(!it.finished){
			r.push("[")
			r.push(escape(it.current))
			r.push("]")
			if(it.moveNext()){
				for(var i=0; i < max; ++i){
					r.push(escape(it.current));
					if(!it.moveNext()) break;
				}
			};
		}
		if(!it.finished){
			r.push("...")
		}
		r.push(qt2);
		
		if(it.finished && it.position <= p){
			r.push("[]")
		}
		it.position = p;
		return r.join("");
	}

	return show;

})