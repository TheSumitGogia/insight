define([

], function() {

  // TODO consider priorities on events...
  var EventManager = {
    _subscriberMap: {},

    handleEvent: function(obj, op, args) {
      var subscriptionArray = this._subscriberMap[obj][op].length;
      for (var i = 0; i < subscriptionArray.length; i++) {
        var subscription = subscriptionArray[i];
        subscription.callback(args);  
      }  
    },

    addSubscriber: function(subscriber, triggerObj, triggerOp, callback) {
      if (!this._subscriberMap[triggerObj]) {
        this._subscriberMap[triggerObj] = {};
      }
      if (!this._subscriberMap[triggerObj][triggerOp]) {
        this._subscriberMap[triggerObj][triggerOp] = [];
      }

      var subscriberArray = this._subscriberMap[triggerObj][triggerOp];
      if (!subscriberArray) { subscriberArray = []; }
      subscriberArray.push({
        obj: subscriber,
        callback: callback
      });
      if (!this._subscriberMap[triggerObj][triggerOp]) { 
        this._subscriberMap[triggerObj][triggerOp] = subscriberArray;
      }
    },

    getBounds: function(paths) {

    }, 

    removeListener: function(obj, op) {
      
    }
  };

  return EventManager;
});
