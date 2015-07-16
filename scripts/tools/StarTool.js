define([
  "paper",
  "underscore",
  "config/Defaults",
  "tools/BaseCreateTool",
  "objects/Geometry"
], function(paper, _, Defaults, BaseCreateTool, Geometry) {
  
  var StarTool = _.extend({}, BaseCreateTool, {
    _currentPath: null,
    
    _params: {
      numPoints: 5,
      inRadius: null,
      outRadius: null
    },

    _startPoint: null,

    onMouseDown: function(event) {
      if (this._params.inRadius) {
        this._outerMouseDown(event);
      } else {
        this._innerMouseDown(event);
      }
    },

    _innerMouseDown: function(event) {
      console.log("Starting star creation...");
      this._startPoint = event.point;
      this._currentPath = new Geometry.Path.Circle(event.point, 1);
      this._currentPath.style = Defaults.tentativeStyle;
    },

    _outerMouseDown: function(event) {
      this._currentPath.remove();
      this._currentPath = new Geometry.Path.Star(
        this._startPoint, 
        this._params.numPoints, 
        this._params.inRadius, 
        this._params.inRadius + 1
      );
      this._currentPath.style = Defaults.tentativeStyle;
    },

    onMouseUp: function(event) {
      if (this._params.inRadius) {
        this._outerMouseUp(event);
      } else {
        this._innerMouseUp(event);
      }
    
    },

    _innerMouseUp: function(event) {
      this._params.inRadius = this._currentPath.bounds.width / 2;
      console.log("Star inner radius defined!");
    },

    _outerMouseUp: function(event) {
      this._currentPath.style = Defaults.committedStyle;
      this._startPoint = null;
      this._params.inRadius = null;
      console.log("Created star! ^^");
    },

    onMouseDrag: function(event) {
      if (this._params.inRadius) {
        this._outerMouseDrag(event);
      } else {
        this._innerMouseDrag(event);
      }
    },

    _innerMouseDrag: function(event) {
      var scaleDelta = this._currentPath.position.getDistance(event.point);
      var currRadius = this._currentPath.firstSegment.point.getDistance(this._currentPath.position);
      var scaleFactor = scaleDelta / currRadius;
      this._currentPath.scale(scaleFactor);
    },

    _outerMouseDrag: function(event) {
      var outerRadius = this._currentPath.position.getDistance(event.point);
      var angle = event.point.subtract(this._currentPath.position).angle;

      this._currentPath.remove();
      this._currentPath = new paper.Path.Star(
        this._startPoint,
        this._params.numPoints,
        this._params.inRadius,
        outerRadius
      );
      this._currentPath.style = Defaults.tentativeStyle;
      this._currentPath.rotate(angle);
    },

    onMouseMove: function(event) {
    
    }    
  });
  return StarTool; 
});
