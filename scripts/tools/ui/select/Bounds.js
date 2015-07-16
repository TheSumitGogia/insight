define([
  "paper",
  "underscore",
  "config/Defaults",
  "utils/PaperUtils",
  "objects/Geometry"
], function(paper, _, Defaults, PaperUtils, Geometry) {

  var Bounds = {
    _linkedGeometry: null,
    _linComboArray: null,
    _boundDots: null,

    redraw: function() {
      var corners = PaperUtils.getBounds(this.linkedGeometry);
      var boundsSize = new paper.Size(corners.xMax - corners.xMin, corners.yMax - corners.yMin);
      var scaleF = boundsSize.divide(this.children[0].bounds.size);
      this.children[0].scale(scaleF.width, scaleF.height);
      
      var maxPoint = new paper.Point(corners.xMax, corners.yMax);
      var minPoint = new paper.Point(corners.xMin, corners.yMin);
      var newCenter = maxPoint.add(minPoint).divide(2);
      this.children[0].translate(newCenter.subtract(this.bounds.center));

      for (var i = 0; i < this._linComboArray.length; i++) {
        var linCombo = new paper.Point(this._linComboArray[i]);
        var boundsPointForm = new paper.Point(boundsSize.width, boundsSize.height);
        var dotPoint = linCombo.multiply(boundsPointForm).add(new paper.Point(corners.xMin, corners.yMin));
        this._boundDots[i].translate(dotPoint.subtract(this._boundDots[i].position));
      } 
    },

    addListeners: function() {
      for (var i = 0; i < this._linkedGeometry.length; i++) {
        this.addEventListener(this._linkedGeometry[i], "translate", function(args) {
          this.redraw();
        });
        this.addEventListener(this._linkedGeometry[i], "scale", function(args) {
          this.redraw();
        });
        this.addEventListener(this._linkedGeometry[i], "rotate", function(args) {
          this.redraw();
        });
      } 
    } 
  };

  var bounds = function(linkedGeometry) {
   
    // first create the paper group
    // you need to go this way because of Paper's goddam constructors 
    var corners = PaperUtils.getBounds(linkedGeometry); 
    var boundsSize = new paper.Size(corners.xMax - corners.xMin, corners.yMax - corners.yMin);

    // TODO: ideally use in-house path
    var bounds = new paper.Path.Rectangle(new paper.Point(corners.xMin, corners.yMin), boundsSize);
    bounds.style = Defaults.boundsStyle;

    var linComboArray = [[0, 0], [0.5, 0], [1, 0], [0, 0.5], [1, 0.5], [0, 1], [0.5, 1], [1, 1]];
    var boundsPointForm = new paper.Point(boundsSize.width, boundsSize.height);
    var boundDots = [];
    for (var i = 0; i < linComboArray.length; i++) {
      var linCombo = new paper.Point(linComboArray[i]);
      var dotPoint = linCombo.multiply(boundsPointForm).add(new paper.Point(corners.xMin, corners.yMin));
      var boundDot = new paper.Path.Circle(dotPoint, 2);
      boundDot.style = Defaults.boundsStyle;
      boundDot.name = "boundDot" + i;
      boundDot.fillColor = "#ffffff";
      boundDots.push(boundDot);
    }
    var boundsGroup = Geometry.Group([bounds]);
    boundsGroup.addChildren(boundDots);
    boundsGroup.bringToFront();
  
    // extend the paper group with the "Bounds" functionality
    _.extend(boundsGroup, Bounds);
    
    // additional properties for "Bounds" functionality
    boundsGroup._linkedGeometry = linkedGeometry;
    boundsGroup._linComboArray = linComboArray;
    boundsGroup._boundDots = boundDots;
    boundsGroup.type = "ui";
    boundsGroup.name = "bounds";
    
    return boundsGroup;
  };

  return bounds;

});
