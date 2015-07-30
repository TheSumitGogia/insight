define([
  "paper",
  "underscore",
  "config/Defaults", 
  "tools/BaseCreateTool",
  "objects/Geometry",
  "objects/Index/Index"
], function(paper, _, Defaults, BaseCreateTool, Geometry, Index) {
  
  var EllipseTool = _.extend({}, BaseCreateTool, {
    _currentPath: null,
    _params: {
      style: {}
    },

    _startDragPoint: null,
  
    _sidebarComponents: ["Styler"],

    setup: function() {
      this.loadSidebarComponents(this._sidebarComponents);
    },

    cleanup: function() {
      this.clearSidebarComponents();
    },

    onMouseDown: function(event) {
      console.log("Starting ellipse creation...");
      this._currentPath = new Geometry.Path.Ellipse(new paper.Rectangle(event.point, new paper.Size(1, 1)));
      this._currentPath.style = Defaults.committedStyle;
      this._currentPath.style = this._params.style;
      this._currentPath.opacity /= 2;
      this._startDragPoint = event.point;
    },
    
    onMouseUp: function(event) {
      this._currentPath.style = Defaults.committedStyle;
      this._currentPath.style = this._params.style;
      this._currentPath.opacity *= 2;
      Index.insert(this._currentPath);
      this._startDragPoint = null;
      this._currentPath = null;
      console.log("Created ellipse! ^^");
    },

    onMouseDrag: function(event) {
      // check how much mouse moved from start
      var deltaX = event.point.x - this._startDragPoint.x;
      var deltaY = event.point.y - this._startDragPoint.y;
      
      // scale the polygon back to new desired size
      var widthScale = Math.abs(deltaX) / this._currentPath.bounds.width;
      var heightScale = Math.abs(deltaY) / this._currentPath.bounds.height;
      var scalePoint = this._currentPath.bounds.topLeft;
      if (widthScale > 0 && heightScale > 0) { 
        this._currentPath.scale(widthScale, heightScale, scalePoint);
      }

      // translate the polygon to new upper left
      if (deltaX >= 0 && deltaY >= 0) {
        this._currentPath.bounds.x = this._startDragPoint.x;
        this._currentPath.bounds.y = this._startDragPoint.y; 
      } else if (deltaX < 0 && deltaY >= 0) {
        this._currentPath.bounds.x = event.point.x;
        this._currentPath.bounds.y = this._startDragPoint.y; 
      } else if (deltaX >= 0 && deltaY < 0) {
        this._currentPath.bounds.x = this._startDragPoint.x;
        this._currentPath.bounds.y = event.point.y;
      } else {
        this._currentPath.bounds.x = event.point.x;
        this._currentPath.bounds.y = event.point.y;
      } 
    },

    onMouseMove: BaseCreateTool.onMouseMove 
  });
  return EllipseTool; 
});
