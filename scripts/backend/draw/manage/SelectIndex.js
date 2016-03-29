define([
  "underscore",
  "backend/draw/manage/ObjectIndex",
  "backend/generic/EventsMixin"
], function(
  _, 
  ObjectIndex, 
  EventsMixin
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

  var SelectIndex = {

    create: function() {
      states = [Selection()];
      currentState = 0;

      var index = this;
      this.addListener("toolSwitch", function(tool) {
        console.log("heard tool switch at sel index");
        this.dispatch("clearSelection");
        var selection = clone(states[currentState]);
        // basically make sure that a "finish" hasn't been executed already
        if (states[currentState].objects.length !== 0) {
          selection.checkpoint = selection.objects.slice(); 
          selection.objects = [];
          selection.examples = [];
          states = [selection];
          currentState = 0;
        }
        this.dispatch("drawSelection", selection);
      });

      this.addListener("finish", function(update) {
        console.log("heard finish selection at sel index");
        this.dispatch("clearSelection");
        var selection = clone(states[currentState]);
        if (update == "none") {
          selection.checkpoint = selection.objects.slice();
        } else if (update == "remove") {
          selection.checkpoint = _.difference(selection.checkpoint, selection.objects);
        } else if (update == "union") {
          selection.checkpoint = _.union(selection.objects, selection.checkpoint);
        } else if (update == "intersect") {
          selection.checkpoint = _.intersection(selection.objects, selection.checkpoint);
        }
        selection.objects = [];
        selection.examples = [];
        states = [selection];
        currentState = 0;
        this.dispatch("drawSelection", selection);
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
    },

    redo: function() {
      console.log("select redo", currentState);
      if (currentState == states.length-1) { return; }
      this.dispatch("clearSelection");
      currentState = currentState + 1;
      var selection = states[currentState];
      this.dispatch("drawSelection", selection);
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
      selection.objects = objects;
      selection.examples.push(example);
      this.dispatch("drawSelection", selection);
      states = states.slice(0, currentState+1);
      states.push(selection);
      currentState = currentState + 1;
    },

    change: function(objects, polarity) {
      console.log("changing selection", objects, polarity);
      console.log("current selection state", states[currentState]);
      this.dispatch("clearSelection");
      var selection = clone(states[currentState]);
      if (selection.examples.length > 0) { selection.examples = []; }
      if (polarity == 1) {
        selection.objects.push.apply(selection.objects, objects);
      } else {
        selection.objects = _.difference(selection.objects, objects);
      };
      this.dispatch("drawSelection", selection);
      states = states.slice(0, currentState+1);
      states.push(selection);
      currentState = currentState + 1;
    }
  };
  _.extend(SelectIndex, EventsMixin);

  return SelectIndex;
});
