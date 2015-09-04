define([
  "underscore",
  "objects/Index/StrokeColorIndex",
  "objects/Index/FillColorIndex",
  "objects/Index/PositionXIndex",
  "objects/Index/PositionYIndex",
  "objects/Index/StrokeWidthIndex",
  "objects/Index/ScaleXIndex",
  "objects/Index/ScaleYIndex",
  "state_management/SelectionManager"
], function(
  _,
  StrokeColorIndex,
  FillColorIndex,
  PositionXIndex,
  PositionYIndex,
  StrokeWidthIndex,
  ScaleXIndex,
  ScaleYIndex,
  SelectionManager
) {

  var Index = {

    _globalIDCounter: 0,
    _objectMap: {},
    _metrics: ["strokeColor", "fillColor", "scaleX", "scaleY", "strokeWidth"],

    _indexes: {
      "strokeColorIndex": StrokeColorIndex,
      "fillColorIndex": FillColorIndex,
      //"positionXIndex": PositionXIndex,
      //"positionYIndex": PositionYIndex
      "scaleXIndex": ScaleXIndex,
      "scaleYIndex": ScaleYIndex,
      "strokeWidthIndex": StrokeWidthIndex      
    },

    getObjectByID: function(id) {
      return this._objectMap[id];
    },

    ballQuery: function(object, metric, tolerance) {
      if (tolerance) {
        var indexName = (metric + "Index");
        return this._indexes[indexName].ballQuery(object, tolerance);
      } else {
        var objects = [];
        for (var i = 0; i < this._metrics.length; i++) {
          var indName = (this._metrics[i] + "Index");
          var objArray = this._indexes[indName].ballQuery(object, metric[this._metrics[i]]);
          objects.push(objArray);
        }
        var ball = _.intersection.apply(null, objects);
        return ball;
      }
    },

    ballQueryByFeatures: function(features, tolerances) {
      var objects = [];
      for (var i = 0; i < this._metrics.length; i++) {
        var metric = this._metrics[i];
        var tolerance = tolerances[this._metrics[i]];
        var index = this._indexes[metric + "Index"];
        var objArray = index.ballQueryByFeatures(features, tolerance);
        objects.push(objArray);
      }
      var ball = _.intersection.apply(null, objects);
      return ball;
    },

    rangeQuery: function(metric, start, end) {
      var indexName = (metric + "Index");
      return this._indexes[indexName].rangeQuery(start, end); 
    },

    getDistance: function(object1, object2) {
      var distObj = {};
      for (var i = 0; i < this._metrics.length; i++) {
        var metric = this._metrics[i];
        distObj[metric] = this._indexes[metric + "Index"].getDistance(object1, object2);
      }
      return distObj;
    },

    getDistances: function(object, metric) {
      var indexName = (metric + "Index");
      return this._indexes[indexName].getDistances(object);
    },

    insert: function(object) {
      object.identifier = this._globalIDCounter;
      this._globalIDCounter += 1;
      this._objectMap[object.identifier] = object;
      SelectionManager.createTerminal(object.identifier);
      for (var index in this._indexes) {
        if (this._indexes.hasOwnProperty(index)) {
          console.log("Inserting at Index into", this._indexes[index].metric);
          this._indexes[index].insert(object);
        }
      }
    },

    modify: function(object) {
      for (var index in this._indexes) {
        if (this._indexes.hasOwnProperty(index)) {
          this._indexes[index].modify(object);
        }
      }
    },

    addToUpdate: function(object) {
      for (var index in this._indexes) {
        if (this._indexes.hasOwnProperty(index)) {
          this._indexes[index].addToUpdate(object);
        }
      }
    },

    remove: function(object) {
      for (var index in this._indexes) {
        if (this._indexes.hasOwnProperty(index)) {
          this._indexes[index].remove(object);
        }  
      }
    },

    update: function() {
      for (var index in this._indexes) {
        if (this._indexes.hasOwnProperty(index)) {
          this._indexes[index].update();
        }
      }
    } 
  
  };
  
  return Index;
});
