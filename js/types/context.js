define(["types/track", "types/iterator"],
function(Track, Iterator){

	class Result {
		constructor(rule, start, end){
			this.rule = rule
			this.values = []
			this.start = start || 0
			this.end = end
			this.isResult = true
		}

		get first(){
			return this.values[0]
		}

		get last(){
			return this.values[this.values.length-1]
		}

		at(index){
			return this.values[index]
		}

		get count(){
			return this.values.length
		}

		display(options, ilevel){

			options = options || {}
			ilevel = ~~ilevel
			var content = this.values.map((v) => v.display(options, ilevel + 1)).join(" ")
			return "(" +
				(options.showILevel? ilevel + ":" : "") +
				((this.rule && this.rule.name) || "N/R") +
				(this.start == null? ""
					:(" " + this.start + ":" + (this.end == null? "?": this.end))
				) +
				(content == null || !content.length? "" : (" " + content)) +
			")"
		}
		toString(){
			return this.display()
		}

		static create(rule, start, end){
			return new Result(rule, start, end)
		}
	}

	class Context extends Iterator{

		constructor(other){
			super(other)
			if(other instanceof Context){
				this.assign(other)
			} else {
				this._vars = {}
				this._result = new Track(new Result(null, 0))
				this._memo = []
			}
		}

		////////////////////////////////////////////////////////////////////////////
		//// accept, reject

		get accepted(){
			return !this.failed;
		}

		set accepted(value){
			this.failed = !value;
		}


		fail(){
			this.failed = true;
			return this;
		}

		accept(){
			this.failed = false;
			return this;
		}

		sliceFrom(start){
			return this.slice(start, this.position)
		}

		////////////////////////////////////////////////////////////////////////////
		//// globals

		get globals(){
			return this._vars
		}

		////////////////////////////////////////////////////////////////////////////
		//// result

		get result(){
			return this._result;
		}

		peekResult(){
			return this._result.peek()
		}

		popResult(){
			return this._result.pop()
		}

		pushResult(value){
			if(!(value && value.isResult)) throw new Error("Invalid result value: " + value)
			this._result.push(value)
			return this
		}

		swapResult(value){
			if(!(value && value.isResult)) throw new Error("Invalid result value: " + value)
			var result = this._result
			result.pop()
			result.push(value)
			return this
		}

		swapRuleResult(value){
		  var ret = this.popResult()
			return this.pushRuleResult(value)
		}

		pushRuleResult(rule){
			var ret = new Result(rule, this.position)
			this.pushResult(ret)
			return ret
		}

		get resultValues(){
			return this.peekResult().values
		}

		get resultFirst(){
			return this.peekResult().first
		}

		get resultLast(){
			return this.peekResult().last
		}

		addResultValue(v){
			this.resultValues.push(v)
		}

		popResultAsValue(ok){
			var v = this.popResult()
			if(ok) this.resultValues.push(v)
		}

		////////////////////////////////////////////////////////////////////////////
		//// memo
		getMemo(index, name){
			var dict = this._memo[index]
			return dict && dict[name]
		}

		setMemo(index, name, value){
			var memo = this._memo
			var dict = memo[index]
			if(!dict) memo[index] = dict = {}
			dict[name] = value
			return this
		}

		////////////////////////////////////////////////////////////////////////////
		//// vars...

		get vars(){
			return this._vars
		}

		getVar(id){
			return this._vars[id]
		}

		setVar(id, value){
			this._vars[id] = value
			return this
		}

		////////////////////////////////////////////////////////////////////////////
		//// clone, assign...

		assign(other){
			if(other instanceof Context){
				super.assign(other)
				this.failed = other.failed
				this._result = other._result
				this._vars = other._vars
				this._memo = other._memo
			}
			return this
		}

		clone(){
			return new Context(this);
		}

		toString(){
			var result = "";
			var pos = this.position
			var len = this.length

			if(len === 0){
				result = "[]";

			} else if(pos < 0) {
				result = "[]" + this.slice(0).toString()

			} else if(pos >= len){
				result = this.slice(0).toString() + "[]"

			} else if(pos == 0) {
				result = "[" + this.get(0) + "]" + this.slice(1)

			} else {
				result = this.slice(0, pos) + "[" + this.current + "]" + this.slice(pos+1);
			}

			return result;
		}

		static from(value){
			if(value instanceof Context) return value;
			return new Context(value);
		}

		static create(value){
			return new Context(value)
		}

	}

	Context.types = {
		Result: Result
	}

	return Context

})
