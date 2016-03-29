define([
  "paper",
  "underscore",
  "frontend/tools/BaseTool",
  "backend/draw/manage/ObjectIndex",
  "backend/draw/manage/SelectIndex",
  "backend/generic/EventsMixin",
  "backend/generic/Communicator"
], function(
  paper, 
  _, 
  BaseTool, 
  ObjectIndex, 
  SelectIndex, 
  EventsMixin, 
  Communicator
) {

  // NOTE: pretty shitty for this to be here
  var searchPrompt = $("#searchInput .prompt");

  var listeners = ["mouseDown", "mouseUp", "mouseEnter", "mouseLeave", "click"];

  var addObjectListeners = function() {
    var allObjects = ObjectIndex.getObjects();
    _.each(allObjects, function(object) {
      _.each(ObjectListeners, function(listener, listenerName) {
        object["on" + listenerName.capitalize()] = ObjectListeners[listenerName];
      });
    });
  };

  var removeObjectListeners = function() {
    var allObjects = ObjectIndex.getObjects();
    _.each(allObjects, function(object) {
      _.each(ObjectListeners, function(listener, listenerName) {
        object["on" + listenerName.capitalize()] = null;
      });
    });
  };

  var ObjectListeners = {
    mouseDown: function(event) {},
    mouseUp: function(event) {},
    click: function(event) {
      var example = {
        object: event.target.identifier,
        polarity: event.modifiers.shift ? -1 : 1
      };
      var selected = Communicator.post("select", "add_example", example); 
      for (var i = 0; i < selected.length; i++) {
        var object = selected[i];
      }
      SelectIndex.update(selected, example);
    },
    mouseEnter: function(event) {},
    mouseLeave: function(event) {}
  };

  var envListeners = ["keyDown"];
  var addEnvListeners = function(tool) {
    _.each(envListeners, function(lname) {
      tool["on" + lname.capitalize()] = EnvListeners[lname].bind(tool);
    });
  };

  var removeEnvListeners = function(tool) {
    _.each(envListeners, function(lname) {
      tool["on" + lname.capitalize()] = null;
    });
  };

  var EnvListeners = {
    keyDown: function(event) {
      BaseTool.onKeyDown.call(this, event);
      if (!searchPrompt.is(":focus")) {
        if (event.key == 'control') { event.preventDefault(); }
        if (event.key == 'z' && event.modifiers.control) {
          console.log("captured undo");
          SelectIndex.undo();
          Communicator.post("select", "pop_example", {});
        } else if (event.key == 'r' && event.modifiers.control) {
          console.log("captured redo");
          SelectIndex.redo();
          var selection = SelectIndex.get();
          var lastEx = selection.examples.last();
          Communicator.post("select", "add_example", lastEx);
        }
      }
    }
  };

  var SearchToolProto = {

    start: function(noload) {
      BaseTool.setup.call(this);

      this.activate();
      addEnvListeners(this);
      addObjectListeners(); 

      var features = ObjectIndex.getFeatures();
      Communicator.post("select", "data", {"features": features, "image": this.image});
    },

    finish: function() {
      removeEnvListeners(this);
      removeObjectListeners();
      Communicator.post("select", "reset", {});
      BaseTool.cleanup.call(this);
    },

  };

  SearchToolProto = _.extend({}, BaseTool, SearchToolProto, EventsMixin);

  var SearchTool = {
    create: function() {
      var selector = new paper.Tool();
      _.extend(selector, SearchToolProto);
      return selector;
    }
  };

  return SearchTool;
});
