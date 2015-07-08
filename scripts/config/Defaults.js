define([
  "paper",
  "underscore"
], function(paper, _) {
  
  var Defaults = {
    tentativeStyle: {
      fillColor: "#a3e5f6",
      strokeColor: "#a3e5f6",
      strokeWidth: 0
    },
  
    committedStyle: {
      fillColor: "#0093b8",
      strokeColor: "#0093b8",
      strokeWidth: 0
    },

    selectionBoundsStyle: {
      fillColor: null,
      strokeColor: "#a3e5f6",
      strokeWidth: 2,
      dashArray: [8, 4]
    },

    selectHitOptions: {
      stroke: true,
      fill: true,
      bounds: true,
      center: true,
      tolerance: 2 
    },   

    representSelectColor: "#ff5050", 
    marqeeSelectColor: "#ff5050" 
  };

  return Defaults;
});
