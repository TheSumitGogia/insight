define([
  "underscore",
  "backend/test/TestCreator",
  "backend/draw/manage/ObjectIndex",
  "backend/generic/EventsMixin"
], function(
  _, 
  TestCreator, 
  ObjectIndex, 
  EventsMixin
) {

  var states = null;
  var currentState = 0;

  var Selection = function() {
    selection = { objects: [], examples: [] };
    selection.copy = function() {
      var copy = {};
      copy.objects = this.objects.slice(),
      copy.examples = this.examples.slice();
      return copy;
    };
    return selection;
  }

  var SelectIndex = {

    create: function() {
      states = [Selection()];
      currentState = 0;
    },

    reset: function(options) {
      states = [Selection()];
      currentState = 0;
    },

    undo: function() {
      if (currentState == 0) { return; }
      this.dispatch("clearSelection");
      currentState = currentState - 1;
      var selection = states[currentState];
      this.dispatch("drawSelection", selection);
    },

    redo: function() {
      if (currentState == states.length-1) { return; }
      this.dispatch("clearSelection");
      currentState = currentState + 1;
      var selection = states.last();
      this.dispatch("drawSelection", selection);
    },

    get: function() {
      var selection = states[currentState];
      return selection.slice();
    },

    // only for use with inferred selections
    update: function(objects, example) {
      this.dispatch("clearSelection");
      var selection = states[currentState].copy();
      selection.objects = objects;
      selection.examples.push(example);
      this.dispatch("drawSelection", selection);
      state.push(selection);
      currentState = currentState + 1;
    },

    change: function(objects, polarity) {
      this.dispatch("clearSelection");
      var selection = states[currentState].copy();
      if (selection.examples.length > 0) { selection.examples = []; }
      if (polarity == 1) {
        selection.objects.push.apply(selection.objects, objects);
      } else {
        selection.objects = _.difference(selection.objects, objects);
      };
      this.dispatch("drawSelection", selection);
      state.push(selection);
      currentState = currentState + 1;
    }
  };
  _.extend(SelectIndex, EventsMixin);

  return SelectIndex;
});
