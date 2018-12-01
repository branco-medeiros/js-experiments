define([
  "utils/test",
  "types/list", "types/iterator",
  "types/enum-list",
  'types/context'
],
function(test, List, Iterator, EnumList, Context){

  function basicListTest(create, initialValue,  chk, msg){
    var list = chk("<list>.create(initialValue)", create(initialValue)).isValid()
    chk("list.length", list.length).isValid()
    chk("list.get(0)", list.get(0)).isValid()
    chk("list.max", list.max).is(list.length - 1)
    chk("list.last", list.last).is(list.get(list.length - 1))
    var other = chk("var other = list.clone", list.clone()).isValid()
    chk("other !== list", other !== list).isTrue()
    chk("other.length", other.length).is(list.length)
    chk("other.get(0)", other.get(0)).is(list.get(0))
    chk("other.last", other.last).is(list.last)
    chk("list.slice(0).toString()", list.slice(0).toString()).is([1, 2, 3, 4].toString())
    chk("list.slice(1, 3).toString()", list.slice(1, 3).toString()).is([2, 3].toString())
    chk("list.range(1, 2).toString()", list.range(1, 2).toString()).is([2, 3].toString())
    return list
  }

  function testListWithArray(){
    test("List with array", function(chk, msg){
      basicListTest(List.create, [1, 2, 3, 4], chk, msg)
    })
  }

  function testListWithList(){
    test("List with List", function(chk, msg){
      basicListTest(List.create, new List([1, 2, 3, 4]), chk, msg)
    })
  }

  function testIterator(){
    test("iterator", function(chk, msg){
      var it = basicListTest(Iterator.create, [1, 2, 3, 4], chk, msg)
    })
  }

  function testEnumList(){
    test("enum-list", function(chk, msg){
      var e = ([1, 2, 3, 4])[Symbol.iterator]()
      var list = basicListTest(EnumList.create, e, chk, msg)
    })
  }

  function testContext(){
    test("context as list", function(chk, msg){
      var ctx = basicListTest(Context.create, [1, 2, 3, 4], chk, msg)
    })
  }

  return {
    testListWithArray: testListWithArray,
    testListWithList: testListWithList,
    testIterator: testIterator,
    testEnumList: testEnumList,
    testContext: testContext
  }
})
