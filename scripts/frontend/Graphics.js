define([
  "jquery",
  "paper",
  "backend/draw/manage/ObjectIndex",
  "backend/draw/manage/SelectIndex",
  "backend/generic/Communicator",
  "backend/generic/EventsMixin"
], function(
  $,
  paper,
  ObjectIndex,
  SelectIndex,
  Communicator,
  EventsMixin
) {

  var paperItems = null;
  var getObjects = function() {
    var getObjRec = function(node, objects) {
      if (node.children === null || !node.children || node.children.length === 0) {
        if (node.fillColor) {
          // NOTE: hack to account for really weird case
          objects.push(node);
        }
      } else {
        // NOTE: hack for compound paths to be like leaves
        if (node.className == 'CompoundPath') {
          objects.push(node); 
        } else {
          var children = node.children;
          for (var i = 0; i < children.length; i++) {
            var child = children[i];
            getObjRec(child, objects);
          }
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


    var minmaxBounds = getMinmaxBounds(objects);
    var trimObjects = [];
    for (var j = 0; j < objects.length; j++) {
      var object = objects[j];
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
      Graphics.trans = [paper.view.bounds.left - newRectBounds.left, paper.view.bounds.top - newRectBounds.top];
      Graphics.scale = [1.0 / maxRatio, [paper.view.bounds.left, paper.view.bounds.top]];
    }
  };

  var selectColor = "#E4007C";
  var posExColor = "#0000ff"; 
  var negExColor = "#ff0000";
  var boundaryWidth = 2;
  var ui = {"select": {}, "selectC": {}, "selectN": {}, "example": {}};

  var pan = {x: 0, y: 0};
  var zoom = 1;

  var Graphics = {
    start: function() {
      var drawCanvas = $("#drawCanvas")[0];
      paper.setup(drawCanvas);

      this.addListener("load", function(image) {
        this.clear();
        this.load(image);        
      });
      this.addListener("drawSelection", this.drawSelectionLt);
      this.addListener("clearSelection", this.clearSelectionLt);
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

    convertPoint: function(point) {
      var newPoint = (point.divide(this.scale[0]));
      newPoint = (newPoint.add(-this.trans[0], -this.trans[1]));
      return newPoint;
    },

    clearUI: function()  {
      // assumes that there's at most one nest level
      /*
      var uiPaths = _.flatten(_.map(ui, _.values));
      _.each(uiPaths, function(uiPath) { uiPath.remove(); });
      */
      this.clearSelectionLt();
      this.clearExamples();
    },

    load: function(image) {
      var SVGString = Communicator.get("image", "image", {"name": image});
      this.pan({x: -pan.x, y: -pan.y});
      pan = {x: 0, y: 0};
      paper.view.zoom *= 1.0 / zoom;
      zoom = 1;
      paper.project.importSVG(SVGString, {
          expandShapes: true
      });
      var paperObjects = getObjects();
      paperItems = paperObjects.slice();
      fit(paperObjects);
      ObjectIndex.load(paperObjects);
      this.redraw();
      this.dispatch("loadGraphics", image);
      this.startSelectionLt();
      paper.view.draw();
    },

    pan: function(delta) {
      // transform delta (canvas size %) into project coordinates
      var delta_t = {
        x: delta.x * paper.view.bounds.width / 100,
        y: delta.y * paper.view.bounds.height / 100 
      };
      pan.x += delta.x;
      pan.y += delta.y;

      paper.view.center = paper.view.center.add(new paper.Point(delta));
      this.redraw();
    },

    zoom: function(delta, stablePoint) {
      var zoomFactor = (delta > 0) ? 1.05 : 1/1.05; 
      paper.view.zoom *= zoomFactor;
      zoom *= zoomFactor;
      this.redraw();
    },

    show: function(selection) {
      var objects = _.map(selection.objects, function(objectID) {
        return ObjectIndex.getObjectByID(objectID);
      });
      _.each(objects, function(object) {
        object.visible = true;
      });
      this.redraw();
    },

    hide: function(selection) {
      var objects = _.map(selection.objects, function(objectID) {
        return ObjectIndex.getObjectByID(objectID);
      });
      _.each(objects, function(object) {
        object.visible = false;
      });
      this.redraw();
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

    startSelection: function() {

    },

    drawSelectionLt: function(selection) {
      console.log("draw selection", selection);
      var cObjects = _.map(selection.checkpoint, function(objectID) {
        return ObjectIndex.getObjectByID(objectID);
      });
      var objects = _.map(selection.objects, function(objectID) {
        return ObjectIndex.getObjectByID(objectID);
      });
      var diff = _.difference(objects, cObjects);
      var inter = _.intersection(objects, cObjects);
      _.each(objects, function(object) {
        /*
        object.oldStrokeColor = object.strokeColor;
        object.oldStrokeWidth = object.strokeWidth;
        object.strokeColor = 'red';
        object.strokeWidth = 2;
        */
        object.fillColor.lightness = object.originFill.lightness; 
        ui["selectN"][object.identifier] = {};
      });
      _.each(cObjects, function(object) {
        object.fillColor.lightness = object.originFill.lightness;
        ui["selectC"][object.identifier] = {};
      });
      /*
      _.each(diff, function(object) {
        object.fillColor.lightness -= (1 - object.fillColor.lightness);
        ui["selectN"][object.identifier] = {};
      }); 
      _.each(inter, function(object) {
        object.fillColor.lightness -= (1 - object.fillColor.lightness);
        ui["selectN"][object.identifier] = {};
      });
      */
      paper.view.draw();
    },

    startSelectionLt: function() {
      //var objects = ObjectIndex.getObjects(); 
      var objects = paperItems;
      _.each(objects, function(object) {
        if (object.fillColor != null) {
          object.fillColor.lightness += (1 - object.fillColor.lightness) / 2;
        }
      });
      paper.view.draw();
    },

    clearSelection: function() {
      _.each(ui["select"], function(boundary, id) {
        boundary.remove();
        delete ui["select"][id];
      });
    },

    clearSelectionLt: function() {
      _.each(ui["selectC"], function(obj, id) {
        var object = ObjectIndex.getObjectByID(id);
        object.fillColor.lightness = object.originFill.lightness;
        delete ui["selectC"][id];
      });
      _.each(ui["selectN"], function(obj, id) {
        var object = ObjectIndex.getObjectByID(id);
        //object.strokeColor = object.oldStrokeColor;
        //object.strokeWidth = object.oldStrokeWidth;
        object.fillColor.lightness = 0.5 + object.originFill.lightness / 2;
        delete ui["selectN"][id];
      });
      paper.view.draw();
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

  _.extend(Graphics, EventsMixin);

  return Graphics;
});
