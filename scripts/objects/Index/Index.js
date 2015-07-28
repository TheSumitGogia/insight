define([
  "objects/Index/StrokeColorIndex",
  "objects/Index/FillColorIndex",
  "objects/Index/PositionXIndex",
  "objects/Index/PositionYIndex",
  "objects/Index/StrokeWidthIndex",
  "objects/Index/ScaleXIndex",
  "objects/Index/ScaleYIndex"
], function(
  StrokeColorIndex,
  FillColorIndex,
  PositionXIndex,
  PositionYIndex,
  StrokeWidthIndex,
  ScaleXIndex,
  ScaleYIndex
) {

  var Index = {

    _globalIDCounter: 0,
    _objectMap: {},

    _indexes: {
      //"strokeColorIndex": StrokeColorIndex,
      "fillColorIndex": FillColorIndex,
      "positionXIndex": PositionXIndex,
      "positionYIndex": PositionYIndex
      //"scaleXIndex": ScaleXIndex,
      //"scaleYIndex": ScaleYIndex,
      //"strokeWidthIndex": StrokeWidthIndex      
    },

    getObjectByID: function(id) {
      return this._objectMap[id];
    },

    ballQuery: function(object, metric, tolerance) {
      var indexName = (metric + "Index");
      return this._indexes[indexName].ballQuery(object, tolerance);
    },

    rangeQuery: function(metric, start, end) {
      var indexName = (metric + "Index");
      return this._indexes[indexName].rangeQuery(start, end); 
    },

    getDistances: function(object, metric) {
      var indexName = (metric + "Index");
      return this._indexes[indexName].getDistances(object);
    },

    insert: function(object) {
      object.identifier = this._globalIDCounter;
      this._globalIDCounter += 1;
      this._objectMap[object.identifier] = object;
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
