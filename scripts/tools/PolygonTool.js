define([
  "paper",
  "underscore",
  "config/Defaults",
  "objects/Geometry",
  "tools/BaseCreateTool",
  "objects/Index/Index"
], function(paper, _, Defaults, Geometry, BaseCreateTool, Index) {
  
  var PolygonTool = _.extend({}, BaseCreateTool, {
    _currentPath: null,
    
    _params: {
      numSides: 5
    },

    onMouseDown: function(event) {
      console.log("Starting polygon creation...");
      this._currentPath = Geometry.Path.RegularPolygon(event.point, this._params.numSides, 1);
      this._currentPath.style = Defaults.tentativeStyle; 
    },

    onMouseUp: function(event) {
      this._currentPath.style = Defaults.committedStyle;
      Index.insert(this._currentPath);
      //console.log("hm", Index._indexes["positionXIndex"].data);
      this._currentPath = null;
      console.log("Created polygon! ^^");
    },

    onMouseDrag: function(event) {
      var scaleDelta = this._currentPath.position.getDistance(event.point);
      var angle = event.point.subtract(this._currentPath.position).angle;
      var currAngle = this._currentPath.firstSegment.point.subtract(this._currentPath.position).angle;
      var currRadius = this._currentPath.firstSegment.point.getDistance(this._currentPath.position);

      var scaleFactor = scaleDelta / currRadius;
      var rotateFactor = angle - currAngle;

      this._currentPath.scale(scaleFactor);
      this._currentPath.rotate(rotateFactor);
    },

    onMouseMove: BaseCreateTool.onMouseMove   
  });
  return PolygonTool; 
});
