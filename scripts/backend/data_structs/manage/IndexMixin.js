define([

], function() {

  var IndexMixin = {
    setManager: function(manager) {
      this._manager = manager;
    },

    request: function(managerName, method, args) {
      this._manager.handleRequest(managerName, method, args);
    }
  };

  return IndexMixin;
});
