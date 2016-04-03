define([
  "paper",
  "underscore",
  "frontend/tools/BaseTool",
  "backend/draw/manage/ObjectIndex",
  "backend/draw/manage/SelectIndex",
  "backend/generic/EventsMixin",
  "frontend/Graphics" // HACK
], function(
  paper, 
  _, 
  BaseTool,
  ObjectIndex, 
  SelectIndex, 
  EventsMixin, 
  Graphics
) {

  // NOTE: pretty shitty for this to be here
  var searchPrompt = $("#searchInput .prompt");

  var listeners = ["mouseDown", "mouseUp", "mouseEnter", "mouseLeave", "click"];
  var marquee = null;
  var dragging = false;
  
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
      console.log("captured select click", event);
      if (!dragging) {
        /*
        var add = event.modifiers.shift ? 1 : -1;
        if (add > 0) {
          var currentObjects = SelectIndex.get().objects;
          currentObjects.push(event.target.identifier);
          SelectIndex.update(currentObjects, 1);
        } else {
          SelectIndex.update([event.target.identifier], 1);
        }
        */
        var shift = event.modifiers.shift ? 1 : -1;
        if (shift > 0) {
          SelectIndex.change([event.target.identifier], 1); 
        } else {
          SelectIndex.update([event.target.identifier], 1);
        }
      }
    },
    mouseEnter: function(event) {},
    mouseLeave: function(event) {}
  };

  var envListeners = ["keyDown", "mouseDrag", "mouseUp"];
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

  var drawTestCircle = function(point) {
    var hm = new paper.Path.Circle(point, 50, 50);
    hm.fillColor = 'red';
  };

  var EnvListeners = {
    keyDown: function(event) {
      BaseTool.onKeyDown.call(this, event);
      if (!searchPrompt.is(":focus")) {
        if (event.key == 'z' && event.modifiers.shift) {
          console.log("captured undo");
          SelectIndex.undo();
        } else if (event.key == 'r' && event.modifiers.shift) {
          console.log("captured redo");
          SelectIndex.redo();
        }
      }
    },

    mouseDrag: function(event) {
      console.log("event", event);
      if (marquee != null) {
        marquee.remove();
        marquee = null;
      }
      dragging = true;
      var downPoint = Graphics.convertPoint(event.downPoint);
      var point = Graphics.convertPoint(event.point);
      marquee = new paper.Path.Rectangle(downPoint, point);
      marquee.fillColor = null;
      marquee.strokeColor = "#F00";
      marquee.strokeWidth = 1;
    },

    mouseUp: function(event) {
      if (marquee) {
        dragging = false;
        var objects = ObjectIndex.getObjects();
        var topLeft = marquee.bounds.topLeft;
        var bottomRight = marquee.bounds.bottomRight;
        var marked = _.filter(objects, function(object) {
          var containedTL = (object.bounds.topLeft.x >= topLeft.x) && (object.bounds.topLeft.y >= topLeft.y);
          var containedBR = (object.bounds.bottomRight.x <= bottomRight.x) && (object.bounds.bottomRight.y <= bottomRight.y);
          return (containedTL && containedBR);
        }); 
        marked = _.map(marked, function(item) {
          return item.identifier;
        });

        marquee.remove();
        marquee = null;
        /*
        var add = event.modifiers.shift ? 1 : -1;
        if (add > 0) {
          var currentObjects = SelectIndex.get().objects;
          currentObjects.push.apply(currentObjects, marked);
          SelectIndex.update(currentObjects, 1);
        } else {
          SelectIndex.update(marked, 1);
        }
        */
        var shift = event.modifiers.shift ? 1 : -1;
        if (shift > 0) {
          SelectIndex.change(marked, 1);
        } else {
          SelectIndex.update(marked, 1);
        }
      }
    }
  };

  var SelectToolProto = {

    start: function() {
      BaseTool.setup.call(this);

      this.activate();
      addEnvListeners(this);
      addObjectListeners();
    },

    finish: function() {
      removeEnvListeners(this);
      removeObjectListeners();
      marquee = null;
      BaseTool.cleanup.call(this);
    },

  };

  SelectToolProto = _.extend({}, BaseTool, SelectToolProto, EventsMixin);

  var SelectTool = {
    create: function() {
      var selector = new paper.Tool();
      _.extend(selector, SelectToolProto);
      return selector;
    }
  };

  return SelectTool;
});
