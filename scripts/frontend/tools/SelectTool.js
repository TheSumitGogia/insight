define([
  "paper",
  "underscore",
  "backend/draw/manage/ObjectIndex",
  "backend/draw/manage/SelectIndex",
  "frontend/tools/BaseTool",
  "backend/generic/EventsMixin"
], function(paper, _, ObjectIndex, SelectIndex, BaseTool, EventsMixin) {

  var SelectTool = _.extend({}, BaseTool, {

    active: false,
    setup: function() {
      BaseTool.setup.call(this);
      this._setupManagement();

      this.activate();
      this._addObjectListeners();
    },

    cleanup: function() {
      this._removeObjectListeners();
      BaseTool.cleanup.call(this);
    },

    _addWorkListeners: function() {
      this.addListener("activate", function(toolName) {
        if (toolName == "select" && !this.active) {
          this.setup();
          this.active = true;
        }
      });

      this.addListener("deactivate", function(toolName) {
        if (toolName == "select" && this.active) {
          this.cleanup();
          this.active = false;
        }
      });
    },

    _addObjectListeners: function() {
      var allObjects = ObjectIndex.getObjects();
      for (var i = 0; i < allObjects.length; i++) {
        var object = allObjects[i];
        object.onMouseDown = this._ObjectListeners.mouseDown;
        object.onMouseUp = this._ObjectListeners.mouseUp;
        object.onClick = this._ObjectListeners.click;
        object.onMouseEnter = this._ObjectListeners.mouseEnter;
        object.onMouseLeave = this._ObjectListeners.mouseLeave;
      }
    },

    _removeObjectListeners: function() {
      var allObjects = ObjectIndex.getObjects();
      for (var i = 0; i < allObjects.length; i++) {
        var object = allObjects[i];
        object.onMouseDown = null; 
        object.onMouseUp = null; 
        object.onClick = null; 
        object.onMouseEnter = null; 
        object.onMouseLeave = null; 
      }
    },

    _ObjectListeners: {

      mouseDown: function(event) {

      },

      mouseUp: function(event) {

      },

      click: function(event) {
        var item = event.target;
        var polarity = event.modifiers.shift ? -1 : 1;
        var update = {
          id: item.identifier,
          polarity: polarity
        };
        SelectIndex.append(update);
      },

      mouseEnter: function(event) {

      },

      mouseLeave: function(event) {

      }
    }
  }, EventsMixin);

  var SelectToolBuilder = {
    initialize: function() {
      this.addListener("setupTools", function() {
        var selector = new paper.Tool();
        _.extend(selector, SelectTool);
        selector._addWorkListeners();
      });
    }
  };
  _.extend(SelectToolBuilder, EventsMixin);
  SelectToolBuilder.initialize();

  return SelectTool;
});
