define([
  "paper",
  "underscore",
  "state_management/EventsMixin",
  "objects/Index/Index"
], function(paper, _, EventsMixin, Index) {

  var PathExtension = {
  
  };

  var PathPrototype = _.extend({}, paper.Path.prototype, EventsMixin, PathExtension);
  // do overrides on PathPrototype
  // Path factory generates 

  var PathOverrides = function(path) {
    var originalTranslate = path.translate;
    path.translate = function() {
      originalTranslate.apply(this, arguments);
      this.dispatch("translate", arguments);
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

  /*
  var PathOverrides = function() {
    var originalTranslate = PathPrototype.translate;
    PathPrototype.translate = function() {
      originalTranslate.apply(this, arguments);
      Index.addToUpdate(this);
    };
    
    var originalScale = PathPrototype.scale;
    PathPrototype.scale = function() {
      originalScale.apply(this, arguments);
      this.dispatch("scale", arguments);
      Index.addToUpdate(this);
    };

    var originalRotate = PathPrototype.rotate;
    PathPrototype.rotate = function() {
      originalRotate.apply(this, arguments);
      this.dispatch("rotate", arguments);
      Index.addToUpdate(this);
    };

    var originalRemove = PathPrototype.remove;
    PathPrototype.remove = function() {
      originalRemove.apply(this, arguments);
      this.removeListeners();
      this.dispatch("remove", []);
      Index.remove(this);
    };
   
     
    var oldSet = PathPrototype._style.set;
    PathPrototype._style.set = function(props) {
      oldSet.call(this._style, props);
      Index.addToUpdate(this);
    };

  };*/

  //PathOverrides();
  
  var Path = function() {
    var path = Object.create(paper.Path.prototype);
    paper.Path.apply(path, arguments);

    PathOverrides(path);
    _.extend(path, EventsMixin, PathExtension);

    path.prototype = PathPrototype;
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
        
        path.prototype = PathPrototype;
        return path;
      };
      return newFactory;
    })(_shapeArray[i]);
  }

  /*
  var Path = function() {
    var path = Object.create(PathPrototype);
    paper.Path.apply(path, arguments);

    var oldSet = path._style.set;
    path._style.set = function(props) {
      oldSet.call(path._style, props);
      Index.addToUpdate(path);
    };

    path.prototype = paper.Path.prototype;
    
    return path;
  };


  var _shapeArray = ["Rectangle", "Circle", "Ellipse", "Line", "Arc", "RegularPolygon", "Star"]; 
  for (var i = 0; i < _shapeArray.length; i++) {
    Path[_shapeArray[i]] = (function(shapeName) {
      var newFactory = function() {
        // TODO: this seems to have worked, but the second line is fishy...
        var paperObject = paper.Path[shapeName];
        var path = Object.create(PathPrototype);
        path = paperObject.apply(path, arguments);

        var oldSet = path._style.set;
        path._style.set = function(props) {
          oldSet.call(path._style, props);
          Index.addToUpdate(path);
        };
        
        path.prototype = paper.Path.prototype;

        return path;
      };
      return newFactory;
    })(_shapeArray[i]);
  }*/
  
  return Path;
});
