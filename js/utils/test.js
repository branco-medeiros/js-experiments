/***
 * - defines a simple test library for js unit-testing purposes;
 * - dependencies: jquery, require
 * - usage:
 * 		var test = require("test")
 * 		test(description, function(ensure, msg){
 *      //do test setup
 *      //...
 *      //for each thing being tested:
 * 			ensure(description, valueOrFn).isTrue()
 * 			//....
 *  	});
 *  - description:
 *  	the 'ensure' function is passed by test to your function and provides
 *  	testing methods; the msg object can be used to show informative messages
 *  	between calls to ensure;
 *
 *  	ensure usage:
 *  		ensure(description, valueOfFunction)
 *
 *  	where:
 *  		- description: the description of the test, for reporting purposes
 *  		- valueOrFunction: the value being tested. it can also be a function, which will
 *  			be evaluated by the test; it can be a promise or the function evaluation can return
 *  			a promise;
 *  	ex:
 *  		ensure("a + b", a + b)
 *
 *  	the ensure call returns an object with the following api that is used to direct
 *  	the type of test being performed; it has the following methods
 *
 *  	- isTrue(): the test result must be a truth value
 *  	- isFalse(): the test result must *not* be a truth value
 *  	- succeeds(): the test result must not throw an exception (or must not fail if it is a function)
 *  	- fails(): the test result must throw an exception (or fail, if it is a promise)
 *  	- isEqual(value): the test subject must be equal (==) to the supplied value;
 *  	- isNotEqual(value): the test subject must not be equal (!=) the supplied value;
 *  	- is(value): the test subject must be (===) the supplied value
 *  	- isNot(value): the test subject must not be (!==) the supplied value
 *
 *    the result of the call to the testing api is the value returned by the test; if the
 *    test resulted in an exception, it will be an Error instance;
 *
 */
define([], function(){

	function Checker(ctx, description, result){
		var self = this;
		self.isValid = function(){
			//same as IsNotNull, just different report text
			ctx.report(result != null && !(result instanceof Error), description, "IS VALID", result );
			return result;
		}

		self.isNotValid = function(){
			//same as IsNull, just different report text
			ctx.report(result ==  null, description, "IS NOT VALID", result);
			return result;
		}

		self.mustSucceed = function(){
			ctx.report(result && !(result instanceof Error), description, "MUST SUCCEED", result)
			return result;
		}

		self.mustFail = function(){
			ctx.report(!result && !(result instanceof Error), description, "MUST FAIL (BUT NOT THROW)", result)
			return result;
		}

		self.isNull = function(){
			ctx.report(result == null, description, "IS NULL", result);
			return result;
		}

		self.isNotNull = function(){
			ctx.report(result != null && !(result instanceof Error), description, "IS NULL", result);
			return result;
		}

		self.mustNotThrow = function(){
			ctx.report(!(result instanceof Error), description, "MUST NOT THROW", result)
			return result;
		}

		self.mustThrow = function(){
			ctx.report(result instanceof Error, description, "MUST THROW", result)
			return result;
		}

		self.isEqual = function(value){
			ctx.report(result == value, description, "IS EQUAL TO " + value, result)
			return result;
		}


		self.isNotEqual = function(value){
			ctx.report(result != value, description, "IS NOT EQUAL TO " + value, result)
			return result;
		}

		self.isTrue = function(value){
			ctx.report(result === true, description, "IS TRUE", result)
			return result;
		}


		self.isFalse = function(value){
			ctx.report(result === false, description, "IS FALSE", result)
			return result;
		}

		self.is = function(value){
			ctx.report(result === value, description, "IS " + value, result)
			return result;
		}

		self.isNot = function(value){
			ctx.report(result !== value, description, "IS NOT " + value, result)
			return result;
		}

		self.allSucceed = function(){
			//assumes result is an array of values and each of
			//those is not falsy
			var ok = result instanceof Array
				&& result.length > 0

			for(var i=0, max = result.length; i < max; ++i){
				if(!result[i]){
					ok = false; break
				}
			}
			ctx.report(ok, description, "ALL SUCCEED", result)
			return result;
		}

		self.matches = function(value){
			//assumes both result and value are an array of results and each of
			//those match individually (==)
			var ok = result instanceof Array
				&& value instanceof Array
				&& result.length === value.length

			for(var i=0, max = result.length; i < max; ++i){
				if(!result[i] == value[i]){
					ok = false; break
				}
			}
			ctx.report(ok, description, "MATCHES " + value, result)
			return result;
		}


	}

	function Msg(message /*...*/){
		var prefix = "     >>";
		var space  = "     >  ";
		var args = [prefix];
		var nl = "\r\n" + space;
		for(var v of arguments){
			args.push(
				(v && v.constructor === String)
				? v.replace(/\r\n/g, nl)
				: v
			)
		}

		console.log.apply(console, args)
	}

	function Ensure(description, valueOrFn){
		var self = this;
		var result = valueOrFn;
		if(result && result.constructor === Function){
			try{
				result = result();
			} catch(ex){
				result = ex;
			}
		}

		//todo: handle promises

		return new Checker(self, description, result)
	}

	function Test(description, fn){
		var self = {};
		self.description = description
		self.fn = fn;
		self.tests = 0;
		self.success = 0;
		self.fails = 0;
		self.thrown = null;
		self.report = function(result, description, report, value){
			self.tests += 1
			if(result) {
				self.success += 1
			} else {
				self.fails += 1
			}
			if(value==null) {
				value = "NULL or UNDEFINED"
			} else if(value instanceof Error){
				value = "ERROR: " + (value.message || "<Unknown Error>")
			} else {
				try{
					value = value.toString();
				} catch(ex){
					value = "UNABLE TO RETRIEVE RESULT: " + ex.message;
				}
			}
			var prefix = (self.tests < 10? "0": "")
				+ self.tests
				+ " - "
				+ (result? "[OK]": "[XX]")
				+ " -"
			var spc = Array(prefix.length).join(" ")

			console.log(prefix, description, report)
			console.log(spc, "=>", ("" + value).replace(/\r\n/g, "\r\n" + spc + "    "));
		}

		console.log("")
		console.log("*** TESTING:", description, "***");
		var exResult = null
		try{
			fn(Ensure.bind(self), Msg.bind(self) )
		} catch(ex){
			self.thrown = ex.message || "<Unknown error>"
			exResult = ex
		}

		console.log("RESULT:");
		console.log("TESTS RUN:", self.tests, "- SUCCESS:", self.success, "- FAILS:", self.fails);
		if(!self.thrown) console.log("*** TEST", self.fails? "FAILED": (self.success? "PASSED" : "NOT PERFORMED"), "***")
		if(self.thrown) console.log("*** TEST WAS INTERRRUPTED BY EXCEPTION", self.thrown, "***");
		if(exResult) console.log(exResult)
		console.log("")
		return self;
	}

	Test.testAll = function(src){
		src = src || this
		for(var k in src){
			if(k !== "testAll" && /^test.+/.test(k)) try{
				src[k]()
			} catch(ex){
				console.log(ex)
			}
		}
	}

	Test.asTest = function(src){
		src.testAll = Test.testAll.bind(src)
		return src
	}

	return Test
})
