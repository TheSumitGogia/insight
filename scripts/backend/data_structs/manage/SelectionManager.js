define([
  "paper",
  "Manager",
  "config/Defaults"
], function(paper, Manager, Defaults) {
  
  var SelectionManager = {

    _selections: {},          // contains links to full selections
    _selectionNodeMap: {},    // contains links to selection nodes, including indiv objects
    _currentSelection: null,  // name for current selection
    _currentNode: null,       // name for current node

    setManager: function(manager) {
      this.manager = manager;
    },

    request: function(managerName, method, args) {
      this._manager.handleRequest(managerName, method, args);
    },
    
    createSelection: function(name) {
      if (this._selections[name]) {
        console.log("[ERROR] selection name already taken!");
        return null; 
      }
      var selection = this._selections[name] = SelectionNode(name, null, null);
      this._selectionNodeMap[name] = selection; 
    },

    getCurrentSelection: function() {
      return this.getSelection(this._currentSelection);
    },

    getCurrentNode: function() {
      return this.getNode(this._currentNode);
    },
  
    switchCurrentSelection: function(name) {
      var selection = this.getSelection(name);
      if (selection) {
        this._currentSelection = name;
        this._currentNode = name;
      } else {
        console.log("[ERROR] selection to switch to doesn't exist");
        return null;
      }
    },

    getSelection: function(name) {
      var selection = this._selections[name];
      if (selection) {
        return selection;
      } else {
        // handle error
        console.log("[ERROR] selection does not exist.");
        return null;
      }
    },

    renameSelection: function(oldName, newName) {
      var selection = this.getSelection(oldName);
      var newSelLoc = this.getSelection(newName);

      if (selection && !newSelLoc) {
        selection.name = newName;
        this._selections[newName] = selection;
        delete this._selections[oldName];
      } else {
        console.log("[ERROR] no selection to rename, or new location taken.");
        return null;
      }
    },

    removeSelection: function(name) {
      var selection = this.getSelection(name);
      if (selection) {
        selection = null;
        delete this._selections[name];
      } else {
        console.log("[ERROR] no selection to remove");
        return null;
      }
    },

    createNode: function(name, objects) {
      var node = SelectionNode(name, objects);
      this._selectionNodeMap[name] = node;
      return node;
    },

    createTerminal: function(object) {
      var node = TerminalNode(object);
      this._selectionNodeMap[node.name] = node;
      return node;
    },

    getNode: function(name) {
      if (this._selectionNodeMap[name]) {
        return this._selectionNodeMap[name];
      } else {
        // handle error
        console.log("[ERROR] node does not exist");
        return null;
      }
    },

    renameNode: function(oldName, newName) {
      var node = this.getNode(oldName);
      var newNodeLoc = this.getNode(newName);

      if (node && !newNodeLoc) {
        node.name = newName;
        this._selectionNodeMap[newName] = node;
        delete this._selectionNodeMap[oldName];
      } else {
        // handle error of other node with same name
        console.log("[ERROR] no node to rename, or new location taken.");
        return null;
      }
    },

    nodeContains: function(nodeName, objectID) {
      var node = this.getNode(nodeName);
      for (var i = 0; i < node.children.length; i++) {
        console.log("checking containment", node.children[i], objectID);
        if (node.children[i].terminal && node.children[i].object === objectID) {
          return true;
        } else {
          if (!node.children[i].terminal) {
            return this.nodeContains(node.children[i].name, objectID);
          }
        }
      }
      return false; 
    },

    updateObjects: function(nodeName, objects) {
      var node = this.getNode(nodeName);
      var objectMap = {};
      for (var i = 0; i < objects.length; i++) {
        objectMap[objects[i]] = true;
      }
      var j = node.children.length;
      while (j--) { 
        if (node.children[j].terminal) {
          if (!(node.children[j].object in objectMap)) {
            node.children[j].parent = null;
            node.children.splice(j, 1); 
          } else {
            objectMap[node.children[j].object] = false;
          }
        } 
      }
      var toAdd = [];
      for (var object in objectMap) {
        if (objectMap.hasOwnProperty(object) && objectMap[object]) {
          toAdd.push("terminal-" + object);
        }
      }
      this.addChildren(nodeName, toAdd);
      console.log("added stuff", node.children);
    },

    removeNode: function(name) {
      var node = this.getNode(name);
      if (node) {
        node = null;
        delete this._selectionNodeMap[name];
      } else {
        console.log("[ERROR] no node to remove");
        return null;
      } 
    },

    setParent: function(nodeNames, parentName) {
      var nodes = [];
      for (var i = 0; i < nodeNames.length; i++) {
        var node = this.getNode(nodeNames[i]);
        if (node) {
          nodes.push(node);
        } else {
          // handle error of nonexisting node
          // no operation gets done
          return null;
        }
      } 
      var parent = this.getNode(parentName);
      if (!parent) { 
        // handle error of nonexisting parent
        // no operation gets done
        return null; 
      }
      for (var j = 0; j < nodes.length; j++) {
        nodes[i].parent = parent;  
      }
      parent.children.concat(nodes);
    },

    setChildren: function(nodeName, childrenNames) {
      var children = [];
      for (var i = 0; i < childrenNames.length; i++) {
        var child = this.getNode(childrenNames[i]);
        if (child) {
          children.push(child);
        } else {
          // handle error of nonexisting node
          // no operation gets done
          return null;
        }
      }
      var node = this.getNode(nodeName);
      if (!node) {
        // handle error of nonexisting node
        // no operation gets done
        return null;
      }
      for (var j = 0; j < children.length; j++) {
        children[j].parent = node;
      }
      node.children = children;
    },

    addChildren: function(nodeName, childrenNames) {
      var children = [];
      for (var i = 0; i < childrenNames.length; i++) {
        var child = this.getNode(childrenNames[i]);
        if (child) {
          children.push(child);
        } else {
          // handle error of nonexisting child
          // no operation gets done
          return null;
        }
      }
      var node = this.getNode(nodeName);
      if (!node) {
        // handle error of nonexisting node
        // no operation gets done
        return null;
      }  
      for (var j = 0; j < children.length; j++) {
        children[j].parent = node;
      }
      node.children.push.apply(node.children, children);
    } 
  };

  var SelectionNode = function(name, parent, children) {
    var node = {};
    node.name = name;
    node.children = [];
    if (parent) { node.parent = parent; }
    if (children) { node.children = children; }  
    return node;
  };

  var TerminalNode = function(objectID) {
    var node = {};
    node.name = "terminal-" + objectID;
    node.object = objectID;
    node.terminal = true;
    node.children = [];
    return node;
  };

  return SelectionManager;
});
