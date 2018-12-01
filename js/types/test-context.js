define(["types/context", "utils/test"],
function(Context, test){


	function init(chk){
		chk.equal = function(test, result, msg){
			return chk(msg, test).isEqual(result)
		}

		chk.strictEqual = function(test, result, msg){
			return chk(msg, test).is(result)
		}

		return chk
	}

	function testContextIteration(){
		test("Context -- iteration", function(assert, msg){
			var ctx =  assert("ctx = new Context('abcd')", new Context("abcd")).isValid()
			assert("ctx.length", ctx.length).is(4)
			assert("ctx.position", ctx.position).is(0)
			assert("ctx.toString()", ctx.toString()).is("[a]bcd")
			assert("ctx.current", ctx.current).is("a")
			assert("ctx.get(2)", ctx.get(2)).is("c")
			assert("ctx.get(10)", ctx.get(10)).is(undefined)
			assert("ctx.slice(0).toString()", ctx.slice(0).toString()).is("abcd");
			assert("ctx.slice(-2)", ctx.slice(-2)).is("cd")
			assert("ctx.moveNext()", ctx.moveNext()).isValid()
			assert("ctx.current", ctx.current).is("b")
			assert("ctx.position = 3", ctx.position = 3).mustNotThrow()
			assert("ctx.current", ctx.current).is("d")
			assert("ctx.sliceFrom(0)", ctx.sliceFrom(0)).is('abc')
			assert("ctx.sliceFrom(-3)", ctx.sliceFrom(-3)).is('bc')
		})
	} //testContext


	function testContextClone(){
		test("Context -- clone", function(assert, msg){
			var ctx =  assert("var ctx = new Context('abcd')", new Context("abcd")).isValid()
			var other = assert("var other = ctx.clone()", ctx.clone()).isValid()

			assert(
				"other.toString() === ctx.toString()",
				other.toString() === ctx.toString()
			).isTrue()

			assert(
				"other.globals === ctx.globals",
				other.globals === ctx.globals
			).isTrue()

		})
	}


	var result = {
		testContextIteration: testContextIteration,
		testContextClone: testContextClone,
		testAll: function(){
			for(var t in result){
				if(t !== "testAll") result[t]()
			}
		}
	}
	return result
})
