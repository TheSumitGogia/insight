define([
  "paper",
  "underscore",
  "config/Defaults",
  "tools/BaseTool"
], function(paper, _, Defaults, BaseTool) {
  
  var DirSelectTool = _.extend({}, BaseTool, {
  
    _currentPath: null,
    _hitType: null,

    setup: function() {
    },

    cleanup: function() {
      var selection = this.request("SelectionManager", "getSelection", ["direct"]);
      if (selection) {
        this.request("SelectionManager", "removeSelection", ["direct"]);
      }
    },

    onMouseDown: function(event) {
      var hitResult = paper.project.hitTest(event.point, Defaults.selectHitOptions);
      if (hitResult) {
        if (hitResult.type == "segment" || hitResult.type == "handle-in" || hitResult.type == "handle-out") {
          this.request("SelectionManager", "addToSelection", ["direct", [hitResult.segment]]);
        } else {
          this._currentPath = hitResult.item;
          this._currentPath.selected = true;
        }
        this._hitType = hitResult.type;
      } else {
        this._currentPath.selected = false;
        this._currentPath = null;
        this._hitType = null;
      }
    },

    onMouseDrag: function(event) {
      // if segment move it
      // if handle move both handles
    },

    onMouseUp: function(event) {
    
    },

    onMouseMove: function(event) {
      BaseTool.onMouseMove(event);
      // hit test within selected obj
      // if on segment highlight
    }

  });
  return DirSelectTool;
});
