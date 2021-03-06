define([
  "underscore",
  "backend/draw/manage/ObjectIndex",
  "backend/generic/EventsMixin",
  "backend/generic/Communicator"
], function(
  _, 
  ObjectIndex, 
  EventsMixin,
  Communicator
) {

  var states = null;
  var currentState = 0;

  var Selection = function() {
    selection = { objects: [], examples: [] };
    selection.checkpoint = [];
    return selection;
  };

  var clone = function(selection) {
    var copy = {};
    copy.objects = selection.objects.slice();
    copy.examples = selection.examples.slice();
    copy.checkpoint = selection.checkpoint.slice();
    return copy;
  };

  var currTool = "search";
  var toolSwitch = false;
  var SelectIndex = {

    create: function() {
      states = [Selection()];
      currentState = 0;

      var index = this;
      this.addListener("toolSwitch", function(tool) {
        console.log("heard tool switch at sel index");
        toolSwitch = true;
        currTool = tool; 
      });
    },

    reset: function(options) {
      states = [Selection()];
      currentState = 0;
    },

    undo: function() {
      console.log("select undo", currentState);
      if (currentState == 0) { return; }
      this.dispatch("clearSelection");
      currentState = currentState - 1;
      var selection = states[currentState];
      this.dispatch("drawSelection", selection);
      // LOGGING
      Communicator.post("image", "log", {
        "operation": "undo",
        "objects": selection.objects,
        "tool": currTool
      }); 
    },

    redo: function() {
      console.log("select redo", currentState);
      if (currentState == states.length-1) { return; }
      this.dispatch("clearSelection");
      currentState = currentState + 1;
      var selection = states[currentState];
      this.dispatch("drawSelection", selection);
      Communicator.post("image", "log", {
        "operation": "redo",
        "objects": selection.objects,
        "tool": currTool
      }); 
    },

    get: function() {
      var selection = states[currentState];
      return clone(selection);
    },

    // only for use with inferred selections
    update: function(objects, example) {
      console.log("updating selection", objects, example);
      console.log("current selection state", states[currentState]);
      this.dispatch("clearSelection");
      var selection = clone(states[currentState]);
      if (toolSwitch) { 
        selection.examples = [];
        toolSwitch = false;
      }
      selection.objects = objects;
      selection.examples.push(example);
      this.dispatch("drawSelection", selection);
      states = states.slice(0, currentState+1);
      states.push(selection);
      currentState = currentState + 1;
      // LOGGING
      Communicator.post("image", "log", {
        "operation": "change",
        "objects": selection.objects,
        "tool": currTool
      }); 
    },

    change: function(objects, polarity) {
      console.log("changing selection", objects, polarity);
      console.log("current selection state", states[currentState]);
      this.dispatch("clearSelection");
      var selection = clone(states[currentState]);
      if (toolSwitch) { 
        selection.examples = [];
        toolSwitch = false;
      }
      var intersect = _.intersection(selection.objects, objects);
      if (intersect.length == 0) {
        selection.objects.push.apply(selection.objects, objects);
      } else {
        selection.objects = _.difference(selection.objects, objects);
      }
      this.dispatch("drawSelection", selection);
      states = states.slice(0, currentState+1);
      states.push(selection);
      currentState = currentState + 1;
      // LOGGING
      Communicator.post("image", "log", {
        "operation": "change",
        "objects": selection.objects,
        "tool": currTool
      }); 
    }
  };
  _.extend(SelectIndex, EventsMixin);

  return SelectIndex;
});
