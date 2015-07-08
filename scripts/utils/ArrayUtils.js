define([
  "paper",
  "underscore",
  "utils/MathUtils"
], function(paper, _, MathUtils) {
  
  var ArrayUtils = {

    //TODO: extend to get multiple properties
    mapProperty: function(array, property) {
      return array.map(function(obj) { 
        return obj[property]; 
      });     
    },   
     
    testAlignment: function(array1, array2) {
      // TODO: there's probably a much nicer functional way for this

      if (array1.length != array2.length) { return false; }
      for (var i = 0; i < array1.length; i++) {
        var check = true;
        for (var j = 0; j < array2.length; j++) {
          if (!MathUtils.tolerance(array1[j], array2[(i + j) % array2.length], 0.0001)) { 
            check = false;
            break; 
          }        
        }
        if (check) { return true; }
      }
      return false;
    } 
  };

  return ArrayUtils;
});
