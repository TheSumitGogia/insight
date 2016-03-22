define([
  "paper",
  "underscore",
  "frontend/Graphics",
  "frontend/tools/BaseTool",
  "backend/draw/manage/ObjectIndex",
  "backend/draw/manage/SelectIndex",
  "backend/generic/EventsMixin",
  "backend/generic/Communicator"
], function(
  paper, 
  _, 
  Graphics,
  BaseTool, 
  ObjectIndex, 
  SelectIndex, 
  EventsMixin, 
  Communicator
) {

  var exShow = false;
  var selShow = true;

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
      BaseTool.onKeyDown.call(this);
      if (event.key == 'u') {
        Communicator.post("select", "pop_example", {});
      } else if (event.key == 'i') {
        var selection = SelectIndex.get();
        var lastEx = selection.examples[-1];
        Communicator.post("select", "add_example", lastEx);
      }
    }
  };

  var SearchToolProto = {

    start: function() {
      BaseTool.setup.call(this);

      this.activate();
      addEnvListeners(this);
      addObjectListeners(); 

      // TODO: move feature extraction to object index
      var features = ObjectIndex.getFeatures();
      Communicator.post("select", "data", {"features": features});
    },

    finish: function() {
      removeEnvListeners(this);
      removeObjectListeners();
      Communicator.post("select", "reset", {});
      exShow = false; selShow = true;
      BaseTool.cleanup.call(this);
    },

  };

  SearchToolProto = _.extend({}, BaseTool, SearchToolProto, EventsMixin);

  var SearchTool = {
    create: function() {
      var selector = new paper.Tool();
      _.extend(selector, SearchToolProto);
    }
  };

  return SearchTool;
});
