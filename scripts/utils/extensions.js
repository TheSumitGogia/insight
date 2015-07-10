define([
  "state_management/EventManager",
  "paper"  
], function(EventManager, paper) {
  paper.Item.prototype.emitEvent = function(op, args) {
    EventManager.handleEvent(this, op, args);   
  };
  
  paper.Item.prototype.respondToEvent = function(obj, op, callback) {
    EventManager.addSubscriber(this, callback, obj, op);    
  }; 

  paper.Item.prototype.removeListener = function(obj, op) {
    EventManager.removeListener(this, obj, op);
  }; 

  paper.Item.prototype.removeListenersForObject = function(obj) {
    EventManager.removeListenersForpaper.Tool(this, obj);
  };

  paper.Item.prototype.removeListenersForOp = function(op) {
  
  };

  paper.Item.prototype.removeListeners = function() {
  
  };
});
