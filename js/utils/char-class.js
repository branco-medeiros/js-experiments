define([], function(){

	var CR = "\r";
	var LF = "\n";
	var TAB = "\t";

	function isLetter(v){
		return v.toUpperCase() !== v.toLowerCase()
	}

	function isNumber(v){
		return v >= '0' && v <= '9';
	}

	class CharClass{
		static letter(v){
			if(v == null) return false;
			v = String(v)[0];
			return isLetter(v);
		}

		static digit(v){
			if(v == null) return false;
			v = String(v)[0];
			return isNumber(v);
		}

		static alphanum(v){
			if(v == null) return false;
			v = String(v)[0];
			return isNumber(v) || isLetter(v)
		}

		static control(v){
			if(v == null) return false;
			v = String(v)[0];
			return v < " ";
		}

		static printable(v){
			if(v == null) return false;
			v = String(v)[0];
			return v >= " " || v === TAB;
		}


		static cr(v){
			if(v == null) return false;
			v = String(v)[0];
			return v === CR;
		}


		static lf(v){
			if(v == null) return false;
			v = String(v)[0];
			return v === LF;
		}


		static tab(v){
			if(v == null) return false;
			v = String(v)[0];
			return v === TAB;
		}

		static blank(v){
			if(v == null) return false;
			v = String(v)[0];
			return v === " " || v === TAB
		}
	}

	return CharClass

})
