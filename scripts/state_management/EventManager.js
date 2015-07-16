define([

], function() {

  // TODO consider priorities on events...
  var EventManager = {
    _listenerMap: {},
    _subscriberMap: {},

    addListener: function(subscriber, target, op, callback) {
      if (!this._listenerMap[target]) {
        this._listenerMap[target] = {};
      }   
      if (!this._listenerMap[target][op]) {
        this._listenerMap[target][op] = [];
      }

      if (!this._subscriberMap[subscriber]) {
        this._subscriberMap[subscriber] = [];
      }

      var listenerArray = this._listenerMap[target][op];
      listenerArray.push({
        subscriber: subscriber,
        callback: callback
      });

      var subscriberArray = this._subscriberMap[subscriber];
      subscriberArray.push({
        target: target,
        op: op
      });
    },

    removeListener: function(subscriber, target, op) {
      var subscriberArray = this._subscriberMap[subscriber];
      if (subscriberArray) {
        for (var i = 0; i < subscriberArray.length; i++) {
          var checkObj = subscriberArray[i];
          if (checkObj.target == target && checkObj.op == op) {
            subscriberArray.splice(i, 1);
            break;
          }
        }
        if (subscriberArray.length === 0) { 
          subscriberArray = null;
          delete this._subscriberMap[subscriber]; 
        }

        var listenerArray = this._listenerMap[target][op];
        for (var j = 0; j < listenerArray.length; j++) {
          var nextCheckObj = listenerArray[j];
          if (nextCheckObj.subscriber == subscriber) {
            listenerArray.splice(j, 1);
            break;
          }
        }
        if (listenerArray.length === 0) { 
          listenerArray = null;
          delete this._listenerMap[target][op]; 
        }
      } 
    },

    removeListeners: function(subscriber) {
      var subscriberArray = this._subscriberMap[subscriber];
      if (subscriberArray) {
        for (var i = 0; i < subscriberArray.length; i++) {
          var checkObj = subscriberArray[i];
          var listenerArray = this._listenerMap[checkObj.target][checkObj.op];
          for (var j = 0; j < listenerArray.length; j++) {
            if (listenerArray[j].subscriber == subscriber) {
              listenerArray.splice(j, 1);
            }
          }
          if (listenerArray.length === 0) { 
            listenerArray = null;
            delete this._listenerMap[checkObj.target][checkObj.op]; 
          }
        }
      }
    },

    dispatch: function(target, op, args) {
      var listenerArray = this._listenerArray[target][op];
      if (listenerArray) {
        for (var i = 0; i < listenerArray.length; i++) {
          var listener = listenerArray[i];
          listener.callback.apply(listener.subscriber, args);
        }
      }
    }
  };

  return EventManager;
});
