define([
  "paper",
  "underscore"
], function(paper, _) {
  
  var MathUtils = {
    
    tolerance: function(float1, float2, epsilon) {
      return (Math.abs(float1 - float2) < epsilon);
    }
  };

  return MathUtils;

});
