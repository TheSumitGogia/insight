define([
  "paper",
  "underscore",
  "backend/draw/manage/SelectIndex",
  "frontend/Graphics"
], function(
  paper, 
  _, 
  Graphics
) {

  var keys = {
    panKey: 'r',
    zoomKey: 'e',
    toggleExKey: 't',
    toggleSelKey: 'y',
    undoKey: 'u',
    redoKey: 'i'
  };

  var BaseTool = {

    onMouseDrag: function(event) {
      if (paper.Key.isDown(keys.panKey)) {
        Graphics.pan(event.delta);
      } 
    },

    onMouseWheel: function(event) {
      if (paper.Key.isDown(keys.zoomKey)) {
        var mousePosition = new paper.Point(event.offsetX, event.offsetY);
        var viewPosition = paper.view.viewToProject(mousePosition);
        Graphics.zoom(event.deltaY, viewPosition); 
        event.preventDefault();
      }
    },

    onKeyDown: function(event) {
      if (event.key == keys.toggleExKey) {
        exShow = !exShow;
        if (exShow) {
          Graphics.drawExamples(SelectIndex.get().examples);
        } else  {
          Graphics.clearExamples();
        }
      } else if (event.key == keys.undoKey) {
        SelectIndex.undo();
      } else if (event.key == keys.redoKey) {
        SelectIndex.redo();
      } else if (event.key == keys.toggleSelKey) {
        selShow = !selShow;
        if (selShow) {
          Graphics.drawSelection(SelectIndex.get());
        }
        else {
          Graphics.clearSelection();
        }
      }
    },

    setup: function() {
      $(paper.view.element).on('mousewheel', this.onMouseWheel.bind(this));
    },

    cleanup: function() {
      $(paper.view.element).off('mousewheel');
    }
  };

  return BaseTool;
});
