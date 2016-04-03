define([
  "paper",
  "underscore",
  "backend/draw/manage/SelectIndex",
  "frontend/Graphics",
  "backend/generic/Communicator"
], function(
  paper, 
  _, 
  SelectIndex,
  Graphics,
  Communicator
) {

  // NOTE: pretty shitty for this to be here
  var searchPrompt = $("#searchInput .prompt");

  var keys = {
    panKey: 'r',
    zoomKey: 'e',
    toggleExKey: 't',
    toggleSelKey: 'control',
    noneFinishKey: 'o',
    removeFinishKey: 'p',
    unionFinishKey: 'u',
    intersectFinishKey: 'i'
  };

  var selShow = true;
  var toggledSelection = null;
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
        event.preventDefault(); 
        if (event.key == keys.toggleSelKey) {
          selShow = !selShow;
          if (selShow) {
            Communicator.post("image", "log", {
              "operation": "toggleOn"
            });
            Graphics.show(SelectIndex.get());
          }
          else {
            Communicator.post("image", "log", {
              "operation": "toggleOff"
            });
            Graphics.hide(SelectIndex.get());
          }
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
