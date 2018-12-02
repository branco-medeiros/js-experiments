define([], function(){

	function parenthise(what, outerprec, innerprec){
    outerprec = ~~outerprec
    innerprec = ~~innerprec
    return (outerprec > 0 && innerprec <= outerprec)
      ? "(" + what + ")"
      : what
  }

	return parenthise
})
