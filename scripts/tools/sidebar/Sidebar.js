define([
  "tools/sidebar/Styler"
], function(Styler) {

  var Sidebar = {
  
    _componentMap: {
      "Styler": Styler
    },

    loadComponent: function(tool, name) {
      // bring element to bottom! then show!
      // preserves ordering
      this._componentMap[name].load(tool);
    },

    loadComponents: function(tool, names) {
      for (var i = 0; i < names.length; i++) {
        this.loadComponent(tool, names[i]);
      }
    },

    clearComponents: function() {
      // remove listeners
      // remove template UI
      for (var name in this._componentMap) {
        if (this._componentMap.hasOwnProperty(name)) {
          var component = this._componentMap[name];
          if (component.visible) { component.remove(); }
        }
      }
    },

    renderComponents: function(names) {
      for (var i = 0; i < names.length; i++) {
        this._componentMap[names[i]].render(); 
      }
    },

    renderAllComponents: function() {
      var names = this._componentMap.keys();
      names = names.filter(function(name) {
        return this._componentMap.hasOwnProperty(name);
      });
      this.renderComponents(names); 
    }
  };

  return Sidebar;
});
