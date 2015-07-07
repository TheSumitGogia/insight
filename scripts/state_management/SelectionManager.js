define([
  "paper",
  "Manager"
], function(paper, Manager) {

  var SelectionManager = {
    setManager: function(manager) {
      this.manager = manager;
    }
  };

  return SelectionManager;
});
