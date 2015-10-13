define([

], function() {
  /*  
  var SelectionIndex = {

    _selections: {},          // contains links to full selections
    _selectionNodeMap: {},    // contains links to selection nodes, including indiv objects
    _currentSelection: null,  // name for current selection
    _currentNode: null,       // name for current node
    _manager: null,

    setManager: function(manager) {
      this._manager = manager;
    },

    request: function(managerName, method, args) {
      this._manager.handleRequest(managerName, method, args);
    },
    
    createSelection: function(name) {
      if (this._selections[name]) {
        throw new NameClashError("selection", name);
      }
      var selection = this._selections[name] = SelectionNode(name, null, null);
      this._selectionNodeMap[name] = selection; 
    },

    getCurrentSelection: function() {
      if (!this._currentSelection) {
        throw new NoObjectError("selection", "current");
      }
      return this.getSelection(this._currentSelection);
    },

    getCurrentNode: function() {
      if (!this._currentNode) {
        throw new NoObjectError("selectNode", "current");
      }
      return this.getNode(this._currentNode);
    },
  
    switchCurrentSelection: function(name) {
      var selection = this.getSelection(name);
      if (selection) {
        this._currentSelection = name;
        this._currentNode = name;
      } else {
        throw new NoObjectError("selection", name);
      }
    },

    getSelection: function(name) {
      var selection = this._selections[name];
      if (selection) {
        return selection;
      } else {
        throw new NoObjectError("selection", name);
      }
    },

    renameSelection: function(oldName, newName) {
      
      var selection, newSelLoc;
      try {
        selection = this.getSelection(oldName);
      } catch (noObjErr) {
        throw noObjErr;
      }

      var newSelLoc = this.getSelection(newName);
      if (newSelLoc) { throw new ExistingObjectError("selection", newName); }

      selection.name = newName;
      this._selections[newName] = selection;
      delete this._selections[oldName];
    },

    removeSelection: function(name) {
      var selection;
      try {
        selection = this.getSelection(name);
      } catch (noObjErr) {
        throw noObjErr;
      }
      
      selection = null;
      delete this._selections[name];
    },

    createNode: function(name, objects) {
      var node;
      try {
        node = SelectionNode(name, objects);
      } catch (existErr) {
        throw existErr;
      }
      this._selectionNodeMap[name] = node;
      return node;
    },

    createTerminal: function(object) {
      var node;
      try {
        node  = TerminalNode(object);
      } catch (existErr) {
        throw existErr;
      }
      this._selectionNodeMap[node.name] = node;
      return node;
    },

    getNode: function(name) {
      var node;
      try {
        node = this._selectionNodeMap[name];
      } catch (existErr) {
        throw existErr;
      }
      return node;
    },

    renameNode: function(oldName, newName) {
      var node, newNodeLoc;
      try {
        node = this.getNode(oldName);
      } catch (noObjErr) {
        throw newObjErr;
      }
      
      newNodeLoc = this.getNode(newName);
      if (newNodeLoc) { throw new ExistingObjectError("selection", newName); }

      node.name = newName;
      this._selectionNodeMap[newName] = node;
      delete this._selectionNodeMap[oldName];
    },

    nodeContains: function(nodeName, objectID) {
      // handle nonexisting node
      var node;
      try {
        node = this.getNode(nodeName);
      } catch (noObjErr) {
        throw noObjErr;
      } 

      // recursively search for terminal node with objectID
      for (var i = 0; i < node.children.length; i++) {
        if (node.children[i].terminal && node.children[i].object === objectID) {
          return true;
        } else if (!node.children[i].terminal) {
          return this.nodeContains(node.children[i].name, objectID);
        }
      }
      return false; 
    },

    // NOTE: This function isn't appropriately generalized! For now, it
    // just thinks the node is 1 level before terminal. Ideally, the 
    // function would take the output sent by the learning server and 
    // update nodes as full selection hierarchies.
    updateObjects: function(nodeName, objects) {
      var node;
      try {
        node = this.getNode(nodeName);
      } catch (noObjErr) {
        throw noObjErr;
      }

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
      // NOTE: no need for try-catch here since it was done at top
      this.addChildren(nodeName, toAdd);
    },

    removeNode: function(name) {
      var node;
      try {
        node = this.getNode(name);
      } catch (noObjErr) {
        throw noObjErr;
      }

      node = null;
      delete this._selectionNodeMap[name];
    },
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
  */
  var SelectionIndex = {}; 
  return SelectionIndex;
});
