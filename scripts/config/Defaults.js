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

    tentative2DStyle: {
      fillColor: new paper.Color(0.64, 0.90, 0.965, 0),
      strokeColor: "#a3e5f6",
      strokeWidth: 1
    },

    committedStyle: {
      fillColor: "#0093b8",
      strokeColor: "#0093b8",
      strokeWidth: 0
    },

    committed2DStyle: {
      fillColor: new paper.Color(0, 0.576, 0.722, 0),
      strokeColor: "#0093b8",
      strokeWidth: 1
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

    handleActiveStyle: {
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
    marqueeSelectColor: "#ff5050" 
  };

  return Defaults;
});
