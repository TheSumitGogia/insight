define([
  "paper",
  "underscore",
  "config/Defaults",
  "state_management/ToolManager"
], function(paper, _, Defaults, ToolManager) {

  var BaseTool = {

    _manager: null,
    _mousePoint: null,
    actionKeys: {
      panXKey: {key: ["a"], value: [false]},
      panYKey: {key: ["s"], value: [false]},
      zoomKey: {key: ["d"], value: [false]},
      deleteKey: {key: ["delete"], value: [false]},
      clearKey: {key: ["end"], value: [false]},
      cutKey: {key: ["shift", "x"], value: [false, false]},
      copyKey: {key: ["shift", "c"], value: [false, false]},
      pasteKey: {key: ["shift", "v"], value: [false, false]} 
    },

    // NOTE: buggy, not in use
    addMouseEvent: function(eventName, matchData, callback) {
      if (!(eventName === "mouseLeave" || 
        eventName === "mouseEnter" || 
        eventName === "mouseMove" || 
        eventName === "mouseDrag" ||
        eventName === "mouseDown" ||
        eventName === "mouseUp" || 
        eventName === "click")) 
      { 
        console.log("Can't add mouse event since event name is illegal");
      }
      
      // assumes that general mouse move code doesn't need to be added
      // that is, it's in the original callback for the tool, now need for specific objects
      var that = this;
      var tool = that; // silly hack because JSHint is dumb
      var paperFunctionName = ["on"] + eventName.capitalizeFirst();
      var oldCallback = tool[paperFunctionName];
      tool[paperFunctionName] = (function() {
        return function(event) {
          console.log(event);
          var matchItems = paper.project.getItems(matchData);
          if (eventName === "mouseMove") {
            var hitResult = paper.project.hitTest(event.point, Defaults.selectHitOptions);
            if (hitResult && hitResult.item.matches(matchData)) {
              callback.apply(hitResult.item, tool, event);
            }
          } else {
            for (var i = 0; i < matchItems.length; i++) {
              callback.apply(matchItems[i], tool, event);
            }
          }
          oldCallback.apply(tool, event);  
        };  
      }());
      console.log(tool.onMouseDown);
    },

    onMouseMove: function(event) {
      this._mousePoint = event.point;
    },

    onKeyDown: function(event) {
      // cycle through keys, set true
      for (var key in this.actionKeys) {
        if (this.actionKeys.hasOwnProperty(key)) {
          var keyData = this.actionKeys[key];
          for (var i = 0; i < keyData.key.length; i++) {
            if (event.key === keyData.key[i]) {
              keyData.value[i] = true;
            }
          }
        }
      }
    }, 

    onKeyUp: function(event) {
      // cycle through keys, set false
      for (var key in this.actionKeys) {
        if (this.actionKeys.hasOwnProperty(key)) {
          var keyData = this.actionKeys[key];
          var foundFlag = false;
          for (var i = 0; i < keyData.key.length; i++) {
            if (event.key === keyData.key[i]) {
              foundFlag = (i + 1);
              break;
            }
          }
          if (foundFlag) {
            for (var j = 0; j < keyData.key.length; j++) {
              if (!keyData.value[j]) { 
                return; 
              }
            }
            event.event.preventDefault();
            keyData.value[foundFlag - 1] = false;
            this.handleKeyPress(key, event);
            return;
          }
        }
      }
    },

    handleKeyPress: function(key, event) {
      console.log(key);
      switch (key) {
        case "deleteKey":
          this.handleDelete(event);
          break;
        case "copyKey":
          this.handleCopy(event);
          break;
        case "cutKey":
          this.handleCut(event);
          break;
        case "pasteKey":
          this.handlePaste(event);
          break;
        case "clearKey":
          this.handleClear(event);
          break;
      }
    },

    handleDelete: function(event) {
      var selection = this.request("SelectionManager", "getCurrentSelection", []);
      console.log("handleDelete", selection);
      if (selection) {
        this.request("PaperManager", "deleteItems", [selection]); 
      }
    },

    handleCopy: function(event) {
      var selection = this.request("SelectionManager", "getCurrentSelection", []);
      if (selection) {
        this.request("PaperManager", "copyItems", [selection]);
      }
    },

    handleCut: function(event) {
      var selection = this.request("SelectionManager", "getCurrentSelection", []);
      if (selection) {
        this.request("PaperManager", "cutItems", [selection]);
      }
    }, 

    handlePaste: function(event) {
      this.request("PaperManager", "pasteItems", [this._mousePoint]);  
    },

    handleClear: function(event) {
      this.request("PaperManager", "clear", []);
    },

    onMouseWheel: function(event) {
      if (this.actionKeys.panYKey.value[0]) {
        this.request("PaperManager", "stepCenter", [event.deltaX, event.deltaY, event.deltaFactor]);  
      } else if (this.actionKeys.panXKey.value[0]) {
        this.request("PaperManager", "stepCenter", [event.deltaY, event.deltaX, event.deltaFactor]);
      } else if (this.actionKeys.zoomKey.value[0]) {
        this.request("PaperManager", "stableStepZoom", [event.deltaY, this._mousePoint]);
      }
      event.preventDefault(); 
    },

    setManager: function(manager) {
      this._manager = manager;
    },

    request: function(manager, method, args) {
      return this._manager.request(manager, method, args); 
    },

    setup: function() {
    
    },

    cleanup: function() {
    
    }
    
  };
  return BaseTool;
});
