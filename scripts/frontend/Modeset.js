define([
  "underscore",
  "jquery",
  "backend/generic/EventsMixin"
], function(
  _,
  $,
  EventsMixin
) {

  var modes = {
    none: { button: $("#noneMode"), mode: "none" },
    remove: { button: $("#removeMode"), mode: "remove" },
    union: { button: $("#unionMode"), mode: "union" },
    intersect: { button: $("#intersectMode"), mode: "intersect" }
  };

  var trimID = function(buttonID) {
    return buttonID.substring(0, buttonID.length - 4);
  };

  var Modeset = {
    start: function() {
      var bar = this;
      _.each(modes, function(mode, modeName) {
        mode.button.click(function(event) {
          bar.dispatch("finish", modeName); 
        });
      });
    },

    reset: function() {
    }
  };
  
  Modeset = _.extend(Modeset, EventsMixin);

  return Modeset;
});
