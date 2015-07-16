define([
  "paper",
  "underscore"
], function(paper, _) {
  
  var Clipboard = {
    _items: null,
    
    get: function() {
      return this._items;
    },

    set: function(items) {
      this._items = items;
    }
  };

  return Clipboard;
});
