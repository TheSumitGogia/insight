define([
  "paper",
  "underscore",
  "state_management/EventsMixin",
  "objects/Index/Index"
], function(paper, _, EventsMixin, Index) {

  var PathExtension = {
  
  };

  var PathOverrides = function(path) {
    var originalTranslate = path.translate;
    path.translate = function() {
      originalTranslate.apply(this, arguments);
      Index.addToUpdate(this);
    };
    
    var originalScale = path.scale;
    path.scale = function() {
      originalScale.apply(this, arguments);
      this.dispatch("scale", arguments);
      Index.addToUpdate(this);
    };

    var originalRotate = path.rotate;
    path.rotate = function() {
      originalRotate.apply(this, arguments);
      this.dispatch("rotate", arguments);
      Index.addToUpdate(this);
    };

    var originalRemove = path.remove;
    path.remove = function() {
      originalRemove.apply(this, arguments);
      this.removeListeners();
      this.dispatch("remove", []);
      Index.remove(this);
    };
    
    var oldSet = path._style.set;
    path._style.set = function(props) {
      oldSet.call(path._style, props);
      Index.addToUpdate(path);
    };

  };

  var Path = function() {
    var path = Object.create(paper.Path.prototype);
    paper.Path.apply(path, arguments);

    PathOverrides(path);
    _.extend(path, EventsMixin, PathExtension);

    return path;
  };

  var _shapeArray = ["Rectangle", "Circle", "Ellipse", "Line", "Arc", "RegularPolygon", "Star"]; 
  for (var i = 0; i < _shapeArray.length; i++) {
    Path[_shapeArray[i]] = (function(shapeName) {
      var newFactory = function() {
        // TODO: this seems to have worked, but the second line is fishy...
        var paperObject = paper.Path[shapeName];
        var path = paperObject.apply({}, arguments);

        PathOverrides(path);
        _.extend(path, EventsMixin, PathExtension);
        
        return path;
      };
      return newFactory;
    })(_shapeArray[i]);
  }
   

  /*
  var Rectangle = function() {
    var path = Object.create(paper.Path.Rectangle.prototype);
    paper.Path.Rectangle.apply(path, arguments); 
      
    PathOverrides(path);
    _.extend(path, EventsMixin, PathExtension);
    return path;
  };

  var Circle = function() {
    var path = Object.create(paper.Path.Circle.prototype);
    paper.Path.Circle.apply(path, arguments);

    PathOverrides(path);
    _.extend(path, EventsMixin, PathExtension);
    return path;
  };

  var Ellipse = function() {
    var path = Object.create(paper.Path.Ellipse.prototype);
    paper.Path.Ellipse.apply(path, arguments);

    PathOverrides(path);
    _.extend(path, EventsMixin, PathExtension);
    return path;
  };*/

  return Path;
});
