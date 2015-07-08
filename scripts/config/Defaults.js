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

    boundsStyle: {
      fillColor: null,
      strokeColor: "#e64848",
      strokeWidth: 1 
    },

    handleStyle: {
      fillColor: "#ff5050",
      strokeColor: "#ff5050",
      strokeWidth: 0
    },

    handleOverStyle: {
      fillColor: "#b23838",
      strokeColor: "#b23838",
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
