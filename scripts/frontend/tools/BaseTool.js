define([
  "paper",
  "underscore",
  "backend/draw/manage/SelectIndex",
  "frontend/Graphics"
], function(
  paper, 
  _, 
  SelectIndex,
  Graphics
) {

  // NOTE: pretty shitty for this to be here
  var searchPrompt = $("#searchInput .prompt");

  var keys = {
    panKey: 'r',
    zoomKey: 'e',
    toggleExKey: 't',
    toggleSelKey: 'v',
    noneFinishKey: 'o',
    removeFinishKey: 'p',
    unionFinishKey: 'u',
    intersectFinishKey: 'i'
  };

  var selShow = false;
  var exShow = false;

  var motionMap = {
    'up': {x: 0, y: -10},
    'down': {x: 0, y: 10},
    'right': {x: 10, y: 0},
    'left': {x: -10, y: 0} 
  };

  var zoomMap = {
    '-': -1,
    '=': 1,
  };

  var BaseTool = {

    onKeyDown: function(event) {
      if (!searchPrompt.is(":focus")) {
        if (event.key == 'control') { event.preventDefault(); }
        if (event.key == keys.toggleExKey) {
          exShow = !exShow;
          if (exShow) {
            Graphics.drawExamples(SelectIndex.get().examples);
          } else  {
            Graphics.clearExamples();
          }
        } else if (event.key == keys.toggleSelKey) {
          selShow = !selShow;
          if (selShow) {
            Graphics.drawSelection(SelectIndex.get());
          }
          else {
            Graphics.clearSelection();
          }
        } else if (event.key == keys.noneFinishKey && !event.modifiers.control) {
          this.dispatch("finish", "none");
        } else if (event.key == keys.removeFinishKey && !event.modifiers.control) {
          this.dispatch("finish", "remove");
        } else if (event.key == keys.unionFinishKey && !event.modifiers.control) {
          this.dispatch("finish", "union");
        } else if (event.key == keys.intersectFinishKey && !event.modifiers.control) {
          this.dispatch("finish", "intersect");
        } else if ((event.key == 'up' || event.key == 'down' || event.key == 'right' || event.key == 'left') && event.modifiers.shift) {
          console.log("caught pan event");
          Graphics.pan(motionMap[event.key]);
        } else if ((event.key == '=' || event.key == '-')) {
          console.log("caught zoom event");
          Graphics.zoom(zoomMap[event.key]);
        }
      }
    },

    setup: function() {
      //$(paper.view.element).on('mousewheel', this.onMouseWheel.bind(this));
    },

    cleanup: function() {
      $(paper.view.element).off('mousewheel');
    }
  };

  return BaseTool;
});
