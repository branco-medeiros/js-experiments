define([], function(){

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

  return Result
})
