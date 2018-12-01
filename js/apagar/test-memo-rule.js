define(["utils/test", "peg/peg", "utils/char-class"], function(test, peg, cc){



  function testMemo(){

    test("MemoRule", function(chk, msg){

      var g = peg.grammar()
      msg("given g = peg.grammar()")

      var prefix = chk("var prefix = g.memo('prefix')", g.memo('prefix')).isValid()
      chk("prefix isntanceof MemoRule", prefix instanceof peg.types.MemoRule).isTrue()

      var cnt = 0
      var result = ""

      function inc(){
        cnt += 1
        return true
      }

      function enter(v){
        return function enter_rule(){
          msg(v);
          return v
        }
      }

      function show(v){
        return function alert(){
          msg(v);
          return v
        }
      }

      function done(v){
        return function set_result(){
          result = v;
          return true
        }
      }

      prefix.assign(
        peg.plus(cc.letter),
        peg.fn(inc),
        peg.fn(done("PREFIX"))
      );

      var array = g("array").assign(
          peg.fn(enter("TESTING:ARRAY")),
          prefix,
          peg.fn(show("  ARRAY:GOT PREFIX ")),
          "[", prefix, "]",
          peg.fn(done("ARRAY"))
      )

      var member = g("selector").assign(
        peg.fn(enter("TESTING:SELECTOR")),
        prefix,
        peg.fn(show("  SELECTOR:GOT PREFIX ")),
        ".", prefix,
        peg.fn(done("SELECTOR"))
      )

      var ident = g("ident").assign(
        peg.fn(enter("TESTING:IDENT")),
        prefix,
        peg.fn(show("  IDENT:GOT PREFIX ")),
        peg.fn(done("IDENT"))
      )

      var alts = g("alts").assign(
        peg.alt(
          array,
          member,
          ident
        )
      )

      g.startRule = alts
      msg("given the following grammar:")
      msg(g.display())

      var ctx = peg.types.Context.from("abc123");

      var ctx2 = chk("var ctx = alts.match('[a]bc123')", alts.match(ctx)).isValid();
      chk("ctx.accepted", ctx2.accepted).isTrue()
      chk("ctx.position", ctx2.position).is(3)
      chk("matched result", result).is("IDENT")
      chk("# of prefix calls", cnt).is(1);
    })

  }

  function testLeftRecursion(){
      test("MemoRule - Left Recursion", function(chk, msg){

          var g = peg.grammar()
          var expr = g.memo("expr")
          var add = g("add")
          var sub = g("sub")
          var num = g("number")
          var _ = g("_").assign(peg.star(" "))

          expr.assign(peg.alt(add, sub, num))
          add.assign(expr, "+", _, num)
          sub.assign(expr, "-", _, num)
          num.assign(peg.cap("num", peg.plus(cc.digit)), _)

          g.startRule = expr

          msg("given the following grammar:")
          msg(g.display())

          var onRule = function(info, ctx){
            if(ctx.failed) return;
            if(info.rule === add || info.rule === sub){
              var v1 = info.children[0].value;
              var v2 = info.children[1].value;
              var result = info.rule === add? v1 + v2: v1 - v2
              msg(info.rule.name + ":", v1, v2, "=>", result);
              info.value = result;

            } else if(info.rule === num){
              var cap = ctx.globals.capture.slice(-1)[0]
              var value = ~~(ctx.slice(cap.start, cap.end))
              msg("num:", value)
              info.value = value

            } else if(info.rule === expr){
              var value = info.children.slice(-1)[0].value
              msg("expr:", value);
              info.value = value
            }
          }

          var ctx = peg.types.Context.from("1 + 2 - 3 + 4 - 5");
          ctx.addListener("leave", onRule);

          msg("given the following input:")
          msg(ctx.toString())

          ctx = chk("g().match(ctx)", g().match(ctx)).isValid()
          chk("ctx.accepted", ctx.accepted).isTrue()
          chk("ctx.finished", ctx.finished).isTrue()
      })
  }



  return {
    testMemo: testMemo,
    testLeftRecursion: testLeftRecursion
  }

})
