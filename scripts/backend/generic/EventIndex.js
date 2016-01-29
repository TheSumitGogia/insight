define([
], function() {

  var EventIndex = {
    _listenerMap: {},

    addListener: function(subscriber, op, callback) {
        if (!this._listenerMap[op]) {
            this._listenerMap[op] = [];
        }

        var listenerArray = this._listenerMap[op];
        listenerArray.push({
            subscriber: subscriber,
            callback: callback
        });
    },

    removeListener: function(subscriber, op) {
        if (this._listenerMap[op]) {
            var listenerArray = this._listenerMap[op];
            for (var j = 0; j < listenerArray.length; j++) {
                var checkObj = listenerArray[j];
                if (checkObj.subscriber == subscriber) {
                    listenerArray.splice(j, 1);
                    break;
                }
            } 
            if (listenerArray.length === 0) {
                listenerArray = null;
                delete this._listenerMap[op];
            }
        }
    },

    removeListeners: function(subscriber) {
        for (var op in this._listenerMap) {
            this.removeListener(subscriber, op);            
        }  
    },

    dispatch: function(target, op) {
        var args = Array.prototype.slice.call(arguments, 2);
        if (this._listenerMap[op]) {
            var listenerArray = this._listenerMap[op];
            for (var i = 0; i < listenerArray.length; i++) {
                var listener = listenerArray[i];
                listener.callback.apply(listener.subscriber, args);
            }
        }
    }
  };

  return EventIndex;
});
