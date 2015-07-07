define([
  "paper",
  "Manager"
], function(paper, Manager) {

  var ModelManager = {
    setManager: function(manager) {
      this.manager = manager;
    }
  };

  return ModelManager;
});
