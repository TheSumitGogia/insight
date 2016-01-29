define([
  "backend/generic/EventIndex"
], function(EventIndex) {
  
    var EventsMixin = {
        dispatch: function(op) {
            var args = [this];
            args.push.apply(args, Array.prototype.slice.call(arguments));
            EventIndex.dispatch.apply(EventIndex, args);
        },

        removeListener: function(op) {
            EventIndex.removeListener(this, op);
        },

        removeListeners: function() {
            EventIndex.removeListener(this);
        },

        addListener: function(op, callback) {
            EventIndex.addListener(this, op, callback);
        }

    };

  return EventsMixin;
});
