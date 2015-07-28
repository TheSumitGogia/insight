define([
  "paper",
  "underscore",
  "objects/Index/Index",
  "tools/BaseTool"
], function(paper, _, Index, BaseTool) {

  var SearchTool = _.extend({}, BaseTool, {
    _stateManager: {},
    selectors: {
      "fillColor": {tolerance: 0, delta: 0.05, objects: []},
      //"strokeColor": {tolerance: 0, delta: 0.05, objects: []},
      // "opacity": {tolerance: 0.05, delta: 0.1, objects: []},
      "positionX": {tolerance: 10, delta: 30, objects: []},
      "positionY": {tolerance: 10, delta: 30, objects: []}
      //"scaleX": {tolerance: 0.1, delta: 0.2, objects: []},
      //"scaleY": {tolerance: 0.1, delta: 0.2, objects: []},
      //"strokeWidth": {tolerance: 0, delta: 2, objects: []}
      //"position": {tolerance: 5, delta: 15, objects: []},
      //"scale": {tolerance: 0.05, delta: 0.1, objects: []}
    },

    setup: function() {
      // change the panel
      this.request("SelectionManager", "setCurrentSelector", ["search"]);
      this.request("SelectionManager", "createSelection", ["search"]);

      var allObjects = paper.project.activeLayer.children;
      if (allObjects.length === 0) { return; }
     
      for (var i = 0; i < allObjects.length; i++) {
        allObjects[i].opacity = 0.2;
        this._stateManager[allObjects[i].identifier] = null;
      }
      paper.view.draw(); // refresh view since mouse not on canvas
      // make sure index is aware of all metric changes
      // TODO: have this done in a background thread?
      Index.update();
      this.addObjectListeners();
    },

    cleanup: function() {
      var allObjects = paper.project.activeLayer.children;
      if (allObjects.length === 0) { return; }
      for (var i = 0; i < allObjects.length; i++) {
        allObjects[i].opacity = 1;
        delete this._stateManager[allObjects[i].identifier];
      }
      this.removeObjectListeners();
    },
    
    onMouseDown: function(event) {

      // if process hasn't started
      //  check for object
      //  if object
      //    for each selector
      //      get properties + tolerances
      //      ball query on properties+tolerances
      //      for each item in ball query result
      //        add stroke to item with selector color
      //        mark each item for selector expansion
      // else
      //  check for object
      //  if object
      //    if marked for selector expansion
      //      clear previous selector expansion marks
      //      add all items in selector expansion to selection
      //      get distances for each object, sort, label with object id?
      //      for each selector
      //        get props+toelrances
      //        ball query on props+tolerances
      //        for each item in ball query result
      //          add stroke to item with selector color
      //          mark each item for selector expansion
      //    if in expansion
      //      shift
      //        remove item from expansion
      //

    },

    onMouseUp: function(event) {
    
    },

    onMouseMove: function(event) {
    
    },

    // object must be not be null-state!
    // returns object IDs!
    _getCommonTentative: function(objectID) {
      var state = this._stateManager[objectID];
      var expansions = [];
      for (var i = 0; i < state.selectors.length; i++) {
        var selector = this.selectors[state.selectors[i]];
        expansions.push(selector.objects);
      }
      var intersection = _.intersection.apply(null, expansions);
      var tool = this;
      intersection = intersection.filter(function(id) {
        return (tool._stateManager[id].name === "tentative");
      });
      return intersection;
    },

    _clearSelectors: function() {
      for (var selector in this.selectors) {
        if (this.selectors.hasOwnProperty(selector)) {
          var selectorParams = this.selectors[selector];
          for (var i = 0; i < selectorParams.objects.length; i++) {
            var objectID = selectorParams.objects[i];
            var state = this._stateManager[objectID];
            if (state === null) {
              continue;
            } else if (state.name === "tentative") {
              this._stateManager[objectID] = null;
            } else {
              state.selectors = [];
            }
          }
          selectorParams.objects = [];
        }
      }
    },

    _addBySelector: function(basis, selector) {
      var selectorParams = this.selectors[selector];

      console.log("Ball Query", basis.identifier, selector, selectorParams.tolerance);
      var ball = Index.ballQuery(basis, selector, selectorParams.tolerance);
      for (var i = 0; i < ball.length; i++) {
        if (this._stateManager[ball[i]]) {
          this._stateManager[ball[i]].selectors.push(selector);
        } else {
          this._stateManager[ball[i]] = {
            name: "tentative",
            selectors: [selector]
          };
          Index.getObjectByID(ball[i]).opacity = 0.6;
        }
      }
      console.log("Ball", selector, ball);
      selectorParams.objects = ball;
    },

    _addBySelectors: function(basis) {
      for (var selector in this.selectors) {
        if (this.selectors.hasOwnProperty(selector)) {
          this._addBySelector(basis, selector); 
        }
      }
    },

    addObjectListeners: function() {
      // grab one path and add listeners
      // by adding to prototype
      
      // representative prath
      var repPath = paper.project.activeLayer.children[0];
      var pathPrototype = repPath.prototype;

      var tool = this;
      pathPrototype.onMouseEnter = function(event) {
        var state = tool._stateManager[this.identifier];
        if (!state) {
          this.opacity = 1; // highlight
        } else if (state.name === "tentative") { 
          this.opacity = 1;
          // NOTE: Source of ambiguity.
          // What does an object in multiple groups represent?
          // Currently intersection
          var narrowGroup = tool._getCommonTentative(this.identifier);
          for (var i = 0; i < narrowGroup.length; i++) {
            Index.getObjectByID(narrowGroup[i]).opacity = 1;
          } 
        }
      };

      pathPrototype.onMouseLeave = function(event) {
        var state = tool._stateManager[this.identifier];
        if (!state) {
          this.opacity = 0.2; // remove highlight
        } else if (state.name === "tentative") {
          this.opacity = 0.6; // reset to tentative highlight
          var narrowGroup = tool._getCommonTentative(this.identifier);
          for (var i = 0; i < narrowGroup.length; i++) {
            Index.getObjectByID(narrowGroup[i]).opacity = 0.6;
          }
        }
      };

      pathPrototype.onClick = function(event) {
        var state = tool._stateManager[this.identifier];
        if (!state) {
          tool.request("SelectionManager", "addToSelection", ["search", this]);
          tool._clearSelectors();
          tool._addBySelectors(this);
          tool._stateManager[this.identifier] = {name: "basis", selectors: []};
        } else if (state.name === "tentative") {
          var narrowGroup = tool._getCommonTentative(this.identifier);
          for (var i = 0; i < narrowGroup.length; i++) {
            tool._stateManager[narrowGroup[i]].name = "selected";
          }
          // make sure only most recently selected object is basis
          state.name = "basis";
          // TODO: get rid of this, should only be 
          // using IDs
          narrowGroup = narrowGroup.map(function(id) {
            return Index.getObjectByID(id);  
          });
          tool.request("SelectionManager", "addToSelection", ["search", narrowGroup]);

          tool._clearSelectors();
          tool._addBySelectors(this);
          // add object to selection
          // make object basis
          // for each item in same expansion
          //   add item to selection
        } else if (state.name === "basis") {
          // ???
          // add objects in all expansions to selection
          // do nothing
          // adjust tolerance
        } else if (state.name === "selected") {
          // remove tentative state from all current expansions
          // set state to basis
          // compute expansions for each selector
          // for each item in each selector
          //   set tentative state
          tool._clearSelectors();
          tool._addBySelectors(this);
          state.name = "basis";
        }
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
    }
  });

  return SearchTool;


});
