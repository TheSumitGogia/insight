define([
  "paper",
  "underscore",
  "state_management/EventsMixin"
], function(paper, _, EventsMixin) {
  
  var PathExtension = {
  
  };

  var PathOverrides = function(path) {
    var originalTranslate = path.translate;
    path.translate = function() {
      originalTranslate.apply(this, arguments);
      this.dispatch(this, "translate", arguments);
    };
    
    var originalScale = path.scale;
    path.scale = function() {
      originalScale.apply(this, arguments);
      this.dispatch(this, "scale", arguments);
    };

    var originalRotate = path.rotate;
    path.rotate = function() {
      originalRotate.apply(this, arguments);
      this.dispatch(this, "rotate", arguments);
    };

    var originalRemove = path.remove;
    path.remove = function() {
      originalRemove.apply(this, arguments);
      this.removeListeners();
    };
  };

  var Path = function() {
    var path = Object.create(paper.Path.prototype);
    paper.Path.apply(path, arguments);

    PathOverrides(path);
    _.extend(path, EventsMixin, PathExtension);
    return path;
  };

  return Path;
});
