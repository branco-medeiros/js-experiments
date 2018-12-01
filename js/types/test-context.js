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


	function testContextToString(){
			test("Context -- toStrng", function(chk, msg){
				var ctx = chk("var ctx = ctx.from('abcdefg1234')", Context.from("abcdefg1234")).isValid()
				chk("when position is 0, ctx.toString()", ctx.toString()).is("[a]bcdefg1234")

				ctx.position = 5
				chk("when position is 5, ctx.toString()", ctx.toString()).is("abcde[f]g1234")

				ctx.position = 10
				chk("when position is 10, ctx.toString()", ctx.toString()).is("abcdefg123[4]")

				ctx.position = -1
				chk("when position is -1, ctx.toString()", ctx.toString()).is("[]abcdefg1234")

				ctx.position = 11
				chk("when position is 11, ctx.toString()", ctx.toString()).is("abcdefg1234[]")


			})
	}


	return test.asTest({
		testContextIteration: testContextIteration,
		testContextClone: testContextClone,
		testContextToString: testContextToString
	})
})
