define([
  "jquery",
  "paper",
  "backend/draw/manage/ObjectIndex",
  "backend/draw/manage/SelectIndex",
  "backend/generic/Communicator"
], function(
  $,
  paper,
  ObjectIndex,
  SelectIndex,
  Communicator
) {

  var getObjects = function() {
    var getObjRec = function(node, objects) {
      if (node.children === null || !node.children || node.children.length === 0) {
        objects.push(node);
      } else {
        var children = node.children;
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          getObjRec(child, objects);
        }
      }
    };

    var allObjects = [];
    var layers = paper.project.layers;
    for (var i = 0; i < layers.length; i++) {
      var layer = layers[i];
      var newObjects = [];
      getObjRec(layer, newObjects);
      allObjects.push.apply(allObjects, newObjects);
    }

    return allObjects;
  };

  var fit = function(objects) {
    var boundTypes = ["left", "right", "top", "bottom"];
    var getMinmaxBounds = function(objects) {
      var allBounds = {};
      var boundMins = {};
      var boundMaxs = {};
      for (var i = 0; i < boundTypes.length; i++) {
        var boundType = boundTypes[i];
        allBounds[boundType] = objects.map(function(obj) {
          return obj.bounds[boundType];         
        });
        boundMins[boundType] = Math.min.apply(Math, allBounds[boundType]);
        boundMaxs[boundType] = Math.max.apply(Math, allBounds[boundType]);
      }
      var resultBounds = {
        'left': boundMins['left'], 
        'right': boundMaxs['right'],
        'top': boundMins['top'],
        'bottom': boundMaxs['bottom']
      };
      return resultBounds;
    };


    var minmaxBounds = getMinmaxBounds(allObjects);
    var trimObjects = [];
    for (var j = 0; j < allObjects.length; j++) {
      var object = allObjects[j];
      var numExtremes = 0;
      for (var k = 0; k < boundTypes.length; k++) {
        var boundType = boundTypes[k];
        if (object.bounds[boundType] == minmaxBounds[boundType]) {
          numExtremes += 1;
        }
      } 
      if (numExtremes < 3) {
        trimObjects.push(object); 
      } 
    }

    var newMinmaxBounds = getMinmaxBounds(trimObjects);
    var width = newMinmaxBounds['right'] - newMinmaxBounds['left'];
    var height = newMinmaxBounds['bottom'] - newMinmaxBounds['top'];
    var newRectBounds = {
      'left': newMinmaxBounds['left'] - (0.05) * width, 
      'right': newMinmaxBounds['right'] + (0.05) * width, 
      'top': newMinmaxBounds['top'] - (0.05) * height,
      'bottom': newMinmaxBounds['bottom'] + (0.05) * height
    };

    var newWidth = newRectBounds['right'] - newRectBounds['left'];
    var newHeight = newRectBounds['bottom'] - newRectBounds['top'];
    var widthRatio = newWidth / paper.view.size.width;
    var heightRatio = newHeight / paper.view.size.height;

    var maxRatio = Math.max.apply(Math, [widthRatio, heightRatio]);
    for (var l = 0; l < paper.project.layers.length; l++) {
      var layer = paper.project.layers[l];
      layer.translate(paper.view.bounds.left - newRectBounds.left, paper.view.bounds.top - newRectBounds.top);
      layer.scale(1.0 / maxRatio, [paper.view.bounds.left, paper.view.bounds.top]);
    }
    this.redraw();

  };

  var selectColor = "#E4007C";
  var posExColor = "#0000ff"; 
  var negExColor = "#ff0000";
  var boundaryWidth = 2;
  var ui = {"select": {}, "example": {}};

  var Graphics = {
    start: function() {
      var drawCanvas = $("#drawCanvas")[0];
      paper.setup(drawCanvas);

      this.addListener("load", this.load);
      this.addListener("drawSelection", this.drawSelection);
      this.addListener("clearSelection", this.clearSelection);
      this.addListener("drawExamples", this.drawExamples);
      this.addListener("clearExamples", this.clearExamples); 
    },

    clear:  function() {
      paper.project.clear();
      this.clearUI();
      ObjectIndex.reset();
      SelectIndex.reset();
    },

    redraw: function() {
      paper.view.draw();
    },

    clearUI: function()  {
      // assumes that there's at most one nest level
      var uiPaths = _.flatten(_.map(ui, _.values));
      _.each(uiPaths, function(uiPath) { uiPath.remove(); });
    },

    load: function(image) {
      var SVGString = Communicator.get("test", "image", {"name": image});
      paper.project.importSVG(SVGString, {
          expandShapes: true
      });
      var paperObjects = getObjects();
      fit(paperObjects);
      ObjectIndex.load(paperObjects);
    },

    pan: function(delta) {
      paper.view.center = paper.view.center.add(delta);
    },

    zoom: function(delta, stablePoint) {
      var zoomFactor = 1.05;
      var center = paper.view.center;
      var newZoom = paper.view.zoom;
      if (delta < 0) {
        newZoom = newZoom / zoomFactor; 
      } else if (delta > 0) {
        newZoom = newZoom * zoomFactor; 
      } 
      var beta = paper.view.zoom / newZoom; 
      var translation = stablePoint.subtract(center);
      var zoomCorrection = stablePoint.subtract(translation.multiply(beta)).subtract(center);
      paper.view.zoom = newZoom;
      paper.view.center = paper.view.center.add(zoomCorrection);
    },

    drawSelection: function(selection) {
      var objects = _.map(selection.objects, function(objectID) {
        return ObjectIndex.getObjectByID(objectID);
      });
      _.each(objects, function(object) {
        var boundary = object.clone(true);
        boundary.fillColor = null;
        boundary.scale(object.strokeBounds.width / object.bounds.width);
        boundary.strokeColor = selectColor;
        boundary.strokeWidth = boundaryWidth;
        ui["select"][object.identifier] = boundary;
      });
    },

    clearSelection: function() {
      _.each(ui["select"], function(boundary, id) {
        boundary.remove();
        delete ui["select"][id];
      });
    },

    drawExamples: function(selection) {
      var examples = _.map(selection.examples, function(example) {
        var exObject = { 
          object: ObjectIndex.getObjectByID(example.id),
          polarity: example.polarity
        };
        return exObject;
      });
      _.each(examples, function(example) {
        var boundary = example.object.clone(true);
        var polarity = example.polarity;
        boundary.fillColor = null; 
        boundary.scale(object.strokeBounds.width / object.bounds.width);
        boundary.strokeColor = (polarity > 0) ? posExColor : negExColor; 
        boundary.strokeWidth = boundaryWidth;
        ui["examples"][object.identifier] = boundary;
      });
    },

    clearExamples: function(selection) {
      _.each(ui["example"], function(boundary, id) {
        boundary.remove();
        delete ui["example"][id];
      });
    }
  };

  return Graphics;
});
