define([
    "paper",
    "underscore",
    "backend/draw/objects/Geometry",
    "backend/generic/EventsMixin",
    "backend/generic/Communicator"
], function(
    paper,
    _,
    Geometry,
    EventsMixin,
    Communicator
) {

  var ObjectIndex = {

    _globalIDCounter: 0,
    _objectMap: {},

    setup: function() {
        this.addListener("initialize", function(tests) {
            this.initialize(tests);
        });

        this.addListener("switchTest", function(newTest, prevIndices, newIndices) {
            this.switchTest(newTest, prevIndices, newIndices);
        });
    },

    initialize: function(tests) {
        this.loadImage(tests[0].image);
        this.loadObjects(); 
        this.dispatch("fit", this.getObjects());
    },

    switchTest: function(newTest, prevIndices, newIndices) {
        this.loadImage(newTest.image);
        this.loadObjects();
        this.dispatch("fit", this.getObjects());
    },

    getObjects: function() {
        var index = this;
        var objects = Object.keys(index._objectMap).map(function(id) {
           return index._objectMap[id];
        }); 
        return objects;
    },

    loadImage: function(imageName) {
        var SVGString = Communicator.get("test", "image", {"name": imageName});
        paper.project.importSVG(SVGString, {
            expandShapes: true
        });
    },

    loadObjects: function() {
        var objects = this._loadPaperObjects();
        for (var i = 0; i < objects.length; i++) {
            Geometry.convert(objects[i]);
            this.insert(objects[i]);
        }
    },

    _loadPaperObjects: function() {

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

    },

    getObjectByID: function(id) {
      return this._objectMap[id];
    },

    insert: function(object) {
      object.identifier = this._globalIDCounter;
      this._globalIDCounter += 1;
      this._objectMap[object.identifier] = object;
    },

    remove: function(id) {
      delete this._objectMap[id];
    },

    reset: function() {
        this._globalIDCounter = 0;
        this._objectMap = {};
    }
  
  };
  _.extend(ObjectIndex, EventsMixin);
  
  return ObjectIndex;
});
