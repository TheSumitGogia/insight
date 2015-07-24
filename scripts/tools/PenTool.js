define([
  "paper",
  "underscore",
  "config/Defaults",
  "tools/BaseCreateTool",
  "utils/PaperUtils",
  "objects/Geometry"
], function(paper, _, Defaults, BaseCreateTool, PaperUtils, Geometry) {
  
  var PenTool = _.extend({}, BaseCreateTool, {
  
    // mouse down
    // start path, add first segment
    // - mouse up
    // - mouse drag
    //  put handles along (prevSeg->dragPoint)
    //
    _currentPath: null,
    _workingSegment: null,

    onMouseDown: function(event) {
      if (!this._currentPath) {
        this._currentPath = Geometry.Path([event.point]);
        this._currentPath.style = Defaults.tentative2DStyle;
        this._currentPath.style.strokeWidth = 1;
        this._workingSegment = this._currentPath.lastSegment;
      } else {
        this._workingSegment.selected = false;
        if (PaperUtils.tolerance(this._currentPath.firstSegment.point, event.point, 5)) {
          this._currentPath.closed = true;
          this._workingSegment = this._currentPath.firstSegment;
          this._workingSegment.handleOut = this._workingSegment.handleIn = new paper.Point(0, 0);
        } else {
          this._currentPath.add(event.point);
          this._workingSegment = this._currentPath.lastSegment;
        }
      }
      this._workingSegment.selected = true; 
    },

    onMouseDrag: function(event) {
      if (!this._workingSegment) { return; }
      if (this._currentPath.closed) {
        this._workingSegment.handleIn = this._workingSegment.handleIn.subtract(event.delta);
        this._workingSegment.handleOut = this._workingSegment.handleOut.add(event.delta);
      } else {
        this._workingSegment.handleOut = this._workingSegment.handleOut.add(event.delta);
        this._workingSegment.handleIn = this._workingSegment.handleIn.subtract(event.delta); 
      }
    },

    onMouseUp: function(event) {
      if (this._currentPath.closed) {
        this._currentPath.lastSegment.selected = false;
        this._currentPath.selected = false;
        this._currentPath.style = Defaults.committed2DStyle;
        this._currentPath = null;
        this._workingSegment = null;
      } 
    },

    onMouseMove: BaseCreateTool.onMouseMove
  });
  return PenTool; 
});
