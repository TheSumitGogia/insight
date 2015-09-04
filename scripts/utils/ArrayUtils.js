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
    },

    average: function(array) {
      var sum = array.reduce(function(item1, item2) { return (item1 + item2); });
      return sum / array.length;
    },

    add: function(array1, array2) {
      // arrays must be same length
      var result = [];
      for (var i = 0; i < array1.length; i++) {
        result[i] = array1[i] + array2[i];
      }    
      return result;
    },

    getSubsets: function(array, minSize) {
      var fn = function(n, src, got, all) {
        if (n === 0) {
          if (got.length > 0) { all[all.length] = got; }
          return;
        }
        for (var j = 0; j < src.length; j++) {
          fn(n - 1, src.slice(j + 1), got.concat([src[j]]), all);
        }
        return;
      };
      var all = [];
      for (var i = minSize; i < array.length; i++) {
        fn(i, array, [], all);
      }
      all.push(array);
      return all;
    },

    randVar: function(variance) {
      if (variance instanceof Array) {
        return variance.map(function(dev) {
          var sign = Math.random() < 0.5 ? -1 : 1;
          return Math.random() * dev * sign;
        });
      } else {
        var sign = Math.random() < 0.5 ? -1 : 1;
        return Math.random() * variance * sign; 
      } 
    },

    compare: function(array1, array2) {
      var diff = _.difference(array1, array2);
      var diff2 = _.difference(array2, array1);

      if (diff.length === 0 && diff2.length === 0) {
        return true;
      }
      return false;
    }
  };

  return ArrayUtils;
});
