define(["utils/test", "peg/peg", "types/context", "utils/char-class"],
function(test, peg, context, cc){

  function testLit(){

    test("PEG -- lit", function(chk, msg){

      var ctx = context.from("abc123")
      var lit = null

      chk("var v = peg.lit('a')",
        function(){
          lit = peg.lit("a")
          return lit
        }
      ).isValid()

      chk("lit match: lit('a').match('[a]bc123') ",

        function(){
          return lit.match(ctx).accepted
        }

      ).is(true)

      chk("lit match: lit('a').match('a[b]c123') ",

        function(){
          return lit.match(ctx).accepted
        }

      ).is(false)


    })
  }

  function testSeq(){

    test("PEG -- seq", function(chk, msg){

        var seq = null;
        var ctx = context.from("abc123")

        chk("var s = peg.seq('a', 'b', 'c')",

          function(){
            seq = peg.seq("a", "b", "c")
            return seq
          }

        ).isValid()

        chk("s.match('[a]bc123') and ctx.position == 3",

          function(){
            return [
              seq.match(ctx).accepted,
              ctx.position == 3
            ]
          }

        ).allSucceed()


        chk("s.match('abc[1]23') fails and ctx.position == 3",

          function(){
            ctx = seq.match(ctx)
            return [ctx.failed, ctx.position == 3]
          }

        ).allSucceed()

    })

  }

  function testAlt(){

    test("PEG -- alt", function(chk, msg){

      var ctx = context.from("ab1")
      var alt

      chk("var alt = peg.alt('a', 'b', 'c')",
        function(){
          alt = peg.alt('a', 'b', 'c')
          return alt
        }
      ).mustSucceed()

      chk("alt.match('[a]b1') and ctx.position == 1",
        function(){
          ctx = alt.match(ctx)
          return [ctx.accepted, ctx.position === 1]
        }
      ).allSucceed()

      chk("alt.match('a[b]1') and ctx.position == 2'",
        function(){
          ctx = alt.match(ctx)
          return [ctx.accepted, ctx.position === 2]
        }
      ).allSucceed()

      chk("alt.match('ab[1]') fails and ctx.position == 2",
        function(){
          ctx = alt.match(ctx)
          return [ctx.failed, ctx.position == 2]
        }
      ).allSucceed()
    })
  }

  function testOpt(){
    test("PEG -- opt", function(chk, msg){

      var ctx = context.from("abc123");

      var opt = chk(
        "var opt = peg.opt(cc.letter, cc.letter, cc.letter)",
        peg.opt(cc.letter, cc.letter, cc.letter)
      ).isValid()

      msg("opt =", opt.display())

      chk("opt.match([a]bc123).accepted", (ctx = opt.match(ctx)).accepted).isTrue()
      chk("after match, the input", ctx).isEqual("abc[1]23")
      chk("opt.match(abc[1]23).accepted", (ctx = opt.match(ctx)).accepted).isTrue()
      chk("after match, the input", ctx).isEqual("abc[1]23")
    })

  } //testOpt


  function testPlus(){
    test("PEG -- plus", function(chk, msg){
      var ctx = context.from("abc123");

      var plus = chk(
        "var plus = peg.plus(cc.letter)",
        peg.plus(cc.letter)
      ).isValid()

      msg("plus =", plus.display())
      chk("plus.match([a]bc123).accepted", (ctx = plus.match(ctx)).accepted ).isTrue()
      chk("after the match, the input", ctx).isEqual("abc[1]23")
      chk("plus.match(abc[1]23).accepted", (ctx = plus.match(ctx)).accepted ).isFalse()
      chk("after the match, the input", ctx).isEqual("abc[1]23")
    })

  } //testPlus


  function testStar(){
    test("PEG -- star", function(chk, msg){
      var ctx = context.from("abc123");

      var star = chk(
        "var star = peg.star(cc.letter)",
        peg.star(cc.letter)
      ).isValid()

      msg("star =", star.display())
      chk("star.match([a]bc123).accepted", (ctx = star.match(ctx)).accepted ).isTrue()
      chk("after the match, the input", ctx).isEqual("abc[1]23")
      chk("star.match(abc[1]23).accepted", (ctx = star.match(ctx)).accepted ).isTrue()
      chk("after the match, the input", ctx).isEqual("abc[1]23")
    })

  } //testStar

  function testCapture(){
    test("PEG -- capture", function(chk, msg){

      msg("given the following matcher cap:")
      /*
        %result = '<'
                  (tag-name:<letter>+) _
                  (arg:
                    (arg-name: <letter>+) _
                    '=' _
                    '"' arg-value: (%isnt '"' %any)* '"' _
                  )*
                  (auto-tag: '/')?
                  '>'
      )
      */
      var _ = peg.star(cc.blank)
      var tagName = peg.cap("tag-name", peg.plus(cc.letter))
      var argName = peg.cap("arg-name", peg.plus(cc.letter))
      var argValue = peg.cap("arg-value", peg.star(peg.isnt("\""), peg.ANY))
      var arg = peg.cap("arg", argName, _, "=", _, '"', argValue, '"')
      var autoClose = peg.cap("auto-close", "/")
      var cap = peg.seq("<", tagName, _, peg.star(arg, _), peg.opt(autoClose), ">")

      function showCap(v){
        var value = ctx.slice(v.start, v.end)
        return `{${v.id}: ${value}}`
      }

      msg("matcher:", cap.display())

      msg("for the following context ctx: ")
      var ctx = context.from('<a href="http://www.google.com" class="btn btn-default" title="teste" >')
      msg("" + ctx)

      chk("cap.match(ctx).accepted", (ctx = cap.match(ctx)).accepted).isTrue()
      chk("ctx.finished", ctx.finished).isTrue()
      var caps = chk("var caps = ctx.result.captures", ctx.result.captures).isValid()
      //chk("caps.lenght", caps.length).is(4);
      chk("caps[0]", showCap(caps[0])).is("{tag-name: a}")
      chk("caps[1]", showCap(caps[1])).is('{arg: href="http://www.google.com"}')
      chk("caps[2]", showCap(caps[2])).is('{arg: class="btn btn-default"}')
      chk("caps[3]", showCap(caps[3])).is('{arg: title="teste"}')
      var child = chk("child = caps[3].children", caps[3].children).isValid()
      chk("child[0]", showCap(child[0])).is("{arg-name: title}")
      chk("child[1]", showCap(child[1])).is("{arg-value: teste}")
    })

  } //testCapture

  function testGrammar(){
    test("PEG -- grammar", function(chk, msg){
      var g = chk("var g = peg.grammar()", () => peg.grammar()).isValid()
      var token = chk(
        "var token = g('token').assign(g('ident'), g('number'), g('string'))",
        g('token').assign(g("ident"), g("number"), g("string"))
      ).isValid()
      chk("token.isRule === true", token.isRule).isTrue()
      chk("g.startRule === token", g.startRule === token).isTrue()
      chk(
        "[g.contains('ident'), g.contains('string'), g.contains('number'), g.contains('token')]",
        [g.contains('ident'), g.contains('string'), g.contains('number'), g.contains('token')]
      ).allSucceed()
      chk("g() === token", g() === token).isTrue()
    })

  }

  return test.asTest({
    testLit: testLit,
    testSeq: testSeq,
    testAlt: testAlt,
    testOpt: testOpt,
    testPlus: testPlus,
    testStar: testStar,
    testCapture: testCapture,
    testGrammar: testGrammar
  })
})
