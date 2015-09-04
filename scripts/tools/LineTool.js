define([
  "paper",
  "underscore",
  "config/Defaults",
  "tools/BaseCreateTool",
  "objects/Geometry",
  "objects/Index/Index"
], function(paper, _, Defaults, BaseCreateTool, Geometry, Index) {
  
  var LineTool = _.extend({}, BaseCreateTool, {
    _currentPath: null,
    _params: {
      style: {}
    },
   
    _sidebarComponents: ["Styler"],
    
    setup: function() {
      this.loadSidebarComponents(this._sidebarComponents);
    },

    cleanup: function() {
      this.clearSidebarComponents();
    },

    onMouseDown: function(event) {
      console.log("Starting line creation...");
      this._currentPath = new Geometry.Path.Line(event.point, event.point);
      this._currentPath.style = Defaults.committedStyle;
      this._currentPath.style = this._params.style;
      this._currentPath.style = {strokeColor: this._currentPath.style.fillColor};
      if (this._currentPath.style.strokeWidth === 0) {
        this._currentPath.style.strokeWidth = 1;
      }
      this._currentPath.opacity /= 2;
    },

    onMouseUp: function(event) {
      this._currentPath.style = Defaults.committedStyle;
      this._currentPath.style = this._params.style;
      this._currentPath.style = {strokeColor: this._currentPath.style.fillColor};
      if (this._currentPath.style.strokeWidth === 0) {
        this._currentPath.style.strokeWidth = 1;
      }
      this._currentPath.opacity *= 2;
      Index.insert(this._currentPath);
      this._currentPath = null;
      console.log("Created line! ^^"); 
    },

    onMouseDrag: function(event) {
      this._currentPath.removeSegment(1);
      this._currentPath.addSegments([event.point]); 
    },

    onMouseMove: BaseCreateTool.onMouseMove
  });
  return LineTool; 
});
