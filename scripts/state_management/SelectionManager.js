define([
  "paper",
  "Manager"
], function(paper, Manager) {

  var SelectionManager = {
    _selections: {},

    setManager: function(manager) {
      this.manager = manager;
    },

    createSelection: function(name, optObjects) {
      if (!this._selections[name]) { 
        console.log("[ERROR] Selection " + name + " already exists! Stopping creation...");
        return false; 
      }
      var selection = this._selections[name] = [];
      if (optObjects) {
        for (var i = 0; i < optObjects.length; i++) {
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

    getSelection: function(name) {
      if (this._selections.hasOwnProperty(name)) {
        return this._selections[name];
      } else {
        console.log("[ERROR] There is no selection named " + name + " to get...");
        return false;
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
        selection.push(object);
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
