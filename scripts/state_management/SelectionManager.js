define([
  "paper",
  "Manager",
  "config/Defaults"
], function(paper, Manager, Defaults) {

  var SelectionManager = {
    _selections: {},
    _currentSelector: null,

    setManager: function(manager) {
      this.manager = manager;
    },

    request: function(managerName, method, args) {
      this._manager.handleRequest(managerName, method, args);
    },

    setCurrentSelector: function(name) {
      this._currentSelector = name;
    },

    createSelection: function(name, optObjects) {
      if (this._selections[name]) { 
        console.log("[ERROR] Selection " + name + " already exists! Stopping creation...");
        return false; 
      }
      var selection = this._selections[name] = [];
      selection.name = name;
      if (optObjects) {
        for (var i = 0; i < optObjects.length; i++) {
          optObjects[i].selectedColor = Defaults[name + "SelectColor"];
          optObjects[i].selected = true;
          selection.push(optObjects[i]);
        } 
      } 
      return true;
    },

    removeSelection: function(name) {
      if (this._selections.hasOwnProperty(name)) {
        for (var i = 0; i < this._selections[name].length; i++) {
          this._selections[name][i].selected = false;
        }
        delete this._selections[name];
        return true;
      } else {
        console.log("[ERROR] There is no selection named " + name + " to remove...");
        return false;
      } 
    },
  
    removeAllSelections: function() {
      for (var name in this._selections) {
        if (this._selections.hasOwnProperty(name)) {
          var selection = this._selections[name];
          for (var i = 0; i < selection.length; i++) {
            selection[i].selected = false;
          }
          this._selections[name] = null;
          delete this._selections[name];
        }
      }
    },

    getSelection: function(name) {
      if (this._selections.hasOwnProperty(name)) {
        return this._selections[name];
      } else {
        console.log("[ERROR] There is no selection named " + name + " to get...");
        return false;
      }
    },

    getCurrentSelection: function() {
      if (this._selections.hasOwnProperty(this._currentSelector)) {
        return this._selections[this._currentSelector];
      }
    },

    hasSelection: function(name) {
      return this._selections.hasOwnProperty(name);
    },

    addToSelection: function(name, object) {
      var selection = this.getSelection(name);
      if (!selection) { 
        return false; 
      } else {
        if (object instanceof Array) {
          for (var i = 0; i < object.length; i++) {
            object[i].selectedColor = Defaults[name + "SelectColor"];
            object[i].selected = true;
          }
          selection.concat(object);
        } else {
          object.selectedColor = Defaults[name + "SelectColor"];
          object.selected = true;
          selection.push(object);
        }
      }
    },

    removeFromSelection: function(name, object) {
      var selection = this.getSelection(name);
      if (!selection) {
        return false;
      } else {
        // this is a place to be careful since we're mutating
        // the array in the loop
        // it only works because we break right after mutation
        for (var i = 0; i < selection.length; i++) {
          if (selection[i].name === object.name) {
            selection.splice(i, 1);
            return true;
          } else {
            return false;
          }
        }
      }
    },

    containedInSelection: function(name, object) {
      var selection = this.getSelection(name);
      if (!selection) {
        return false;
      } else {
        for (var i = 0; i < selection.length; i++) {
          if (selection[i].name === object.name) {
            return true;
          } else { 
            return false; 
          }
        }
      }
    },

    clearSelections: function() {
      for (var selection in this._selections) {
        if (this._selections.hasOwnProperty(selection)) {
          delete this._selections[selection];
        }
      }
    }
  };

  return SelectionManager;
});
