define([
  "paper",
  "underscore",
  "config/Defaults",
  "tools/BaseCreateTool"
], function(paper, _, Defaults, BaseCreateTool) {
  
  var LineTool = _.extend({}, BaseCreateTool, {
    _currentPath: null,
    _params: {},
    
    onMouseDown: function(event) {
      console.log("Starting line creation...");
      this._currentPath = new paper.Path.Line(event.point, event.point);
      this._currentPath.style = Defaults.tentativeStyle;
      this._currentPath.style.strokeWidth = 1;
    },

    onMouseUp: function(event) {
      this._currentPath.style = Defaults.committedStyle;
      this._currentPath.style.strokeWidth = 1;
      console.log("Created line! ^^"); 
      console.log(this._currentPath);
    },

    onMouseDrag: function(event) {
      this._currentPath.removeSegment(1);
      this._currentPath.addSegments([event.point]); 
    },

    onMouseMove: function(event) {
    
    } 
  });
  return LineTool; 
});
