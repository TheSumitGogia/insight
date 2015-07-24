define([
  "paper",
  "utils/PaperUtils"
], function(paper, PaperUtils) {

  var BasicIndex = {
    _modifiedList: {},

    data: {},

    ballQuery: function(object, tolerance) {
      var objectID = object.identifier;
      var objectRow = this.data[objectID];
      var ball = [];
      for (var i = 0; i < objectRow.length; i++) {
        if (objectRow[i] < tolerance) {
          ball.push(i);
        }
      }
      return ball;
    },

    rangeQuery: function(start, end) {
      // not supported with current data structure
    },

    getDistances: function(object) {
      return this.data[object.identifier];
      // TODO: perhaps sort and attach IDs  
    },

    insert: function(object) {
      var allObjects = paper.project.activeLayer.children;
      var metricName = this.metric;
      var metricType = this.type;
      var objectProp = PaperUtils.getPropByString(object, metricName);
      if (!this.data[object.identifier]) {
        this.data[object.identifier] = {};
      }
      for (var i = 0; i < allObjects.length; i++) {
        var itemId = allObjects[i].identifier;
        var itemProp = PaperUtils.getPropByString(allObjects[i], metricName);
        var distance = PaperUtils.distance(objectProp, itemProp, metricType);
        this.data[object.identifier][allObjects[i].identifier] = {
          id: allObjects[i].identifier,
          distance: distance
        }; 
        this.data[allObjects[i].identifier][object.identifier] = {
          id: object.identifier, 
          distance: distance
        };
      }
    },

    modify: function(object) {
      this.insert(object);
    },

    remove: function(object) {
      this.data[object.identifier] = null;
      delete this.data[object.identifier];
      for (var id in this.data) {
        if (this.data.hasOwnProperty(id)) {
          delete this.data[id][object.identifier];
        }
      }
    },

    addToUpdate: function(object) {
      // possible slight read-write optimization here...
      console.log("caught update");
      this._modifiedList[object.identifier] = true;
    },

    update: function() {
      for (var i = 0; i < this._modifiedList; i++) {
        this.modify(this.data[this._modifiedList[i]]);
      }
    }
  };
  return BasicIndex;
    
});
