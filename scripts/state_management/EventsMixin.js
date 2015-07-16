define([
  "state_management/EventManager"
], function(EventManager) {
  
  var EventsMixin = {
    dispatch: function(op, args) {
      EventManager.dispatch(this, op, args);
    },

    removeListener: function(target, op) {
      EventManager.removeListener(this, target, op);
    },

    removeListeners: function() {
      EventManager.removeListeners(this);
    },

    addListener: function(target, op, callback) {
      EventManager.addListener(target, op, callback);
    }
  };

  return EventsMixin;
});
