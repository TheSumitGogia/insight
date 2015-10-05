define([
  "paper",
  "underscore",
  "objects/Index/Index",
  "tools/BaseTool",
  "tools/Classifier"
], function(paper, _, Index, BaseTool, Classifier) {
  
  var SearchTool = _.extend({}, BaseTool, {
   
    classifier: null,
    _sidebarComponents: ["Styler"],
    _params: {
      numSides: 5,
      style: {}
    },

    setup: function() {
      // sidebar has history and style manager
      // if selection
      //   don't create one!
      // else
      //   create one
      this.loadSidebarComponents(this._sidebarComponents);
      this.request("SelectionManager", "createSelection", ["search"]);
      this.request("SelectionManager", "switchCurrentSelection", ["search"]);
      var allObjects = paper.project.activeLayer.children;
      if (allObjects.length === 0) { return; }
     
      for (var i = 0; i < allObjects.length; i++) {
        allObjects[i].opacity = 0.2;
      }
      paper.view.draw(); // refresh view since mouse not on canvas
      Index.update();
      this.addObjectListeners();
      this.classifier = Classifier();
    },

    cleanup: function() {
      // clear sidebar components
      this.clearSidebarComponents();
      this.removeObjectListeners();
      // KEEP selection
    },

    onMouseUp: function(event) {
    
    },

    onMouseDown: function(event) {
    
    },

    onMouseDrag: function(event) {
    
    },

    onClick: function(event) {
    
    },

    addObjectListeners: function() {
      var getKeys = function(object) {
        var keys = [];
        for (var key in object) {
          if (object.hasOwnProperty(key)) {
            keys.push(key);
          }
        }
        return keys;
      };
      
      var tool = this;
      var repPath = paper.project.activeLayer.children[0];
      var pathPrototype = repPath.prototype;
   
      pathPrototype.onMouseEnter = function(event) {
        // show stuff to add / remove
        var currentNode = tool.request("SelectionManager", "getCurrentNode", []);
        console.log("current node at enter", currentNode);
        var identity = this.identifier;
        if (tool.request("SelectionManager", "nodeContains", [currentNode.name, identity])) {
          console.log("whatnow");
          tool.classifier.update({id: identity, label: -1}, false);
          var removedObjects = getKeys(tool.classifier.objectMap).filter(function(object) {
            return (tool.classifier.tentativeObjectMap[object] === -1 && tool.classifier.objectMap[object] === 1);
          });
          for (var i = 0; i < removedObjects.length; i++) {
            var removedObject = Index.getObjectByID(removedObjects[i]);
            removedObject.opacity = 0.2;
          } 
        } else {
          console.log("here hereb");
          tool.classifier.update({"id": identity, "label": 1}, false);
          var newObjects = getKeys(tool.classifier.objectMap).filter(function(object) {
            return (tool.classifier.tentativeObjectMap[object] === 1 && tool.classifier.objectMap[object] === -1);
          });
          for (var j = 0; j < newObjects.length; j++) {
            var newObject = Index.getObjectByID(newObjects[j]);
            newObject.opacity = 1;
          }
        }
      
      };

      pathPrototype.onMouseLeave = function(event) {
        // stop showing stuff to add / remove
        var currentNode = tool.request("SelectionManager", "getCurrentNode", []);
        if (tool.classifier.tentative) {
          console.log("was tentative");
          if (tool.request("SelectionManager", "nodeContains", [currentNode.name, this.identifier])) {
            var removedObjects = getKeys(tool.classifier.objectMap).filter(function(object) {
              return (tool.classifier.tentativeObjectMap[object] === -1 && tool.classifier.objectMap[object] === 1);
            }); 
            for (var i = 0; i < removedObjects.length; i++) {
              var removedObject = Index.getObjectByID(removedObjects[i]);
              removedObject.opacity = 1;
            }
          } else {
            var addedObjects = getKeys(tool.classifier.objectMap).filter(function(object) {
              return (tool.classifier.tentativeObjectMap[object] === 1 && tool.classifier.objectMap[object] === -1);    
            });
            for (var j = 0; j < addedObjects.length; j++) {
              var addedObject = Index.getObjectByID(addedObjects[j]);
              addedObject.opacity = 0.2;
            }    
          }
          tool.classifier.discard();
        }
      
      };

      pathPrototype.onClick = function(event) {
        var currentNode = tool.request("SelectionManager", "getCurrentNode", []);
        tool.classifier.commit();
        var newObjects = getKeys(tool.classifier.objectMap).filter(function(object) {
          return (tool.classifier.objectMap[object] === 1);
        });
        tool.request("SelectionManager", "updateObjects", [currentNode.name, newObjects]);  
      };
      
      var allObjects = paper.project.activeLayer.children;
      for (var i = 0; i < allObjects.length; i++) {
        allObjects[i].onMouseEnter = allObjects[i].prototype.onMouseEnter;
        allObjects[i].onMouseLeave = allObjects[i].prototype.onMouseLeave;
        allObjects[i].onClick = allObjects[i].prototype.onClick;
      } 
    },

    removeObjectListeners: function() {
      var repObject = paper.project.activeLayer.children[0];
      var pathPrototype = repObject.prototype;
      delete pathPrototype["onMouseEnter"];
      delete pathPrototype["onMouseLeave"];
      delete pathPrototype["onClick"];
    
      var allObjects = paper.project.activeLayer.children;
      for (var i = 0; i < allObjects.length; i++) {
        allObjects[i].onMouseEnter = null;
        allObjects[i].onMouseLeave = null;
        allObjects[i].onClick = null;
      }
    
    },

    // TODO: tab key saves current selection and starts new

    // object mouse handlers
    objectMouseHandlers: {
    
      onMouseUp: function(event) {
    
      },

      onMouseDown: function(event) {

      },

      onClick: function(event) {

      },

      onMouseEnter: function(event) {
      },

      onMouseLeave: function() {
      }

    }

    // paper UI mouse handlers
  });

  return SearchTool;
});
