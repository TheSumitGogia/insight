define([
  "paper",
  "underscore",
  "config/Defaults",
  "utils/PaperUtils",
  "tools/BaseTool",
  "state_management/EventManager"
], function(paper, _, Defaults, PaperUtils, BaseTool, EventManager) {
  
  var SelectTool = _.extend({}, BaseTool, {

    _downPoint: null,
    _marqee: null,
    _tentative: null,
    selection: null,
    _handles: null,
    _activeHandle: null,
    _bounds: null,


    onMouseDown: function(event) {
      var breakFlag = this._handlesMouseDown(event);
      if (breakFlag) { return; }

      var hitResult = paper.project.hitTest(event.point, Defaults.selectHitOptions);
      
      if (hitResult) {
        if (hitResult.item.selected) { return; }
        this._clearSelection();
        this._downPoint = event.point;
        this._tentative = hitResult.item;
      } else {
        this._clearSelection(); 
      } 
    },
    
    _clearSelection: function() {
      if (this.selection) {
        for (var i = 0; i < this.selection.length; i++) {
          this.selection[i].selected = false;
        }
      }
      this.selection = null;
      if (this.selectionBounds) {
        this._bounds.remove();
        this._bounds = null;
        for (var j = 0; j < this._handles.length; j++) {
          this._handles[j].remove();
        }
        this._handles = null;
      }
    },

    onMouseUp: function(event) {
      if (this.selection) {
        var breakFlag = this._handlesMouseUp(event);
        if (breakFlag) { return; }
        this._moveMouseUp(event);
      } else {
        this._marqeeMouseUp(event);
      }
    },
    
    _marqeeMouseUp: function(event) {
      if (PaperUtils.tolerance(event.point, this._downPoint, 2)) {
        if (this._tentative) {
          this.selection = [this._tentative];  
        }
      } else {
        var marqee = this._marqee;
        this.selection = paper.project.getItems({
          bounds: function(bounds) {
            var topLeftCheck = bounds.topLeft.x > marqee.bounds.topLeft.x && 
              bounds.topLeft.y > marqee.bounds.topLeft.y;
            var bottomRightCheck = bounds.bottomRight.x < marqee.bounds.bottomRight.x && 
              bounds.bottomRight.y < marqee.bounds.bottomRight.y;
            return (topLeftCheck && bottomRightCheck);
          }
        });
      }
      if (this._marqee) { this._marqee.remove(); }
      this._downPoint = this._tentative = this._marqee = null;
      if (this.selection) {
        for (var i = 0; i < this.selection.length; i++) {
          this.selection[i].selectedColor = Defaults.marqeeSelectColor;
          this.selection[i].selected = true;
        }
        this.selectionBounds = this.createBounds(this.selection);
        this.selectionHandles = this.createHandles(this._bounds);
      }
    },

    _moveMouseUp: function(event) {
    
    },

    onMouseDrag: function(event) {
      if (this.selection) {
        this._moveMouseDrag(event);
      } else {
        this._marqeeMouseDrag(event);
      }
    },

    _marqeeMouseDrag: function(event) {
      // if marqee hasn't been created, create it!
      if (!this._marqee) {
        this._marqee = new paper.Path.Rectangle(this._downPoint, new paper.Size(1, 1));
        this._marqee.style = Defaults.selectionBoundsStyle;
      }
      // check how much mouse moved from start
      var deltaX = event.point.x - this._downPoint.x;
      var deltaY = event.point.y - this._downPoint.y;
     
      // scale the polygon back to new desired size
      var widthScale = Math.abs(deltaX) / this._marqee.bounds.width;
      var heightScale = Math.abs(deltaY) / this._marqee.bounds.height;
      var scalePoint = this._marqee.bounds.topLeft;
      if (widthScale > 0 && heightScale > 0) { 
        this._marqee.scale(widthScale, heightScale, scalePoint);
      }

      this._marqee.position = event.point.add(this._downPoint).divide(2);
    },

    _moveMouseDrag: function(event) {
      var breakFlag = this._handlesMouseDrag(event);
      if (breakFlag) { return; }
      
      var delta = event.point.subtract(event.lastPoint);
      for (var i = 0; i < this.selection.length; i++) {
        this.selection[i].translate(delta.x, delta.y);
      }
      this.selectionBounds.translate(delta.x, delta.y);
      this.selectionHandles.translate(delta.x, delta.y);
    },

    onMouseMove: function(event) {
    
    },

    createBounds: function(paths) {
      var topLeftXVals = paths.map(function(path) { 
        return path.bounds.x;
      });
      var topLeftYVals = paths.map(function(path) {
        return path.bounds.y;
      });
      var bottomRightXVals = paths.map(function(path) {
        return path.bounds.bottomRight.x;
      });
      var bottomRightYVals = paths.map(function(path) {
        return path.bounds.bottomRight.y;
      });
      var xMin = Math.min.apply(null, topLeftXVals);
      var xMax = Math.max.apply(null, bottomRightXVals);
      var yMin = Math.min.apply(null, topLeftYVals);
      var yMax = Math.max.apply(null, bottomRightYVals);
    
      var boundsSize = new paper.Size(xMax - xMin, yMax - yMin);
      var bounds = new paper.Path.Rectangle(new paper.Point(xMin, yMin), boundsSize);
      bounds.style = Defaults.boundsStyle;

      var linComboArray = [[0, 0], [0.5, 0], [1, 0], [0, 0.5], [1, 0.5], [0, 1], [0.5, 1], [1, 1]];
      var boundsPointForm = new paper.Point(boundsSize.width, boundsSize.height);
      var boundDots = [];
      for (var i = 0; i < linComboArray.length; i++) {
        var linCombo = new paper.Point(linComboArray[i]);
        var dotPoint = linCombo.multiply(boundsPointForm).add(new paper.Point(xMin, yMin));
        var boundDot = new paper.Path.Circle(dotPoint, 2);
        boundDot.style = Defaults.boundsStyle;
        boundDot.name = "boundDot" + i;
        boundDot.fillColor = "#ffffff";
        boundDots.push(boundDot);
      }
      var boundsGroup = new paper.Group([bounds]);
      boundsGroup.addChildren(boundDots);
      boundsGroup.type = "ui";
      boundsGroup.name = "bounds";
      boundsGroup.linkedGeometry = paths;
      EventManager.addSubscriber(boundsGroup, paths, "scale", function(args) {
        boundsGroup.scale(args[0], args[1], args[2]);    
      });
      boundsGroup.bringToFront();
      this._bounds = boundsGroup;
    
    },

    createHandles: function(bounds) {
      var scaleHandle = new paper.Path([
        new paper.Point(50, 50),
        new paper.Point(80, 20),
        new paper.Point(80, 35),
        new paper.Point(120, 35),
        new paper.Point(120, 20),
        new paper.Point(150, 50),
        new paper.Point(120, 80),
        new paper.Point(120, 65),
        new paper.Point(80, 65),
        new paper.Point(80, 80)
      ]);
      scaleHandle.closed = true;
      scaleHandle.style = Defaults.handleStyle;
      scaleHandle.scale(0.2);

      var mapHandleToBoundPoint = {
        0: 3,
        1: 0,
        2: 1,
        3: 2,
        4: 4,
        5: 7,
        6: 6,
        7: 5
      };

      var scaleHandles = [];
      for (var i = 0; i < 8; i++) {
        var newHandle = i === 0 ? scaleHandle : scaleHandle.clone({insert: true});
        newHandle.rotate(45 * i);
        var boundPointMatch = bounds.getItem({name: ("boundDot" + mapHandleToBoundPoint[i])});
        newHandle.position = boundPointMatch.position;
        newHandle.type = "handle";
        scaleHandles.push(newHandle);
      }
      for (var j = 0; j < 8; j++) {
        scaleHandles[j].opposite = scaleHandles[(j + 4) % 8];
        scaleHandles[j].linkedBounds = bounds;
        scaleHandles[j].bringToFront();
      }

      var handlesGroup = new paper.Group(scaleHandles);
      this._handles = scaleHandles;
      this._createHandleListeners();

    },

    _createHandleListeners: function() {
      var that = this;
      var tool = that;
      var handles = this._handles;
      var linkedBounds = this._bounds;
      for (var i = 0; i < handles.length; i++) {
        var handle = handles[i];
        handle.onMouseEnter = function(event) {
          this.style = Defaults.handleActiveStyle;
        };
        
        handle.onMouseLeave = function(event) {
          if (!this.active) {
            this.style = Defaults.handleStyle;
          }
        };
      }
      EventManager.addSubscriber(handles, linkedBounds, "scale", function(args) {
        var mapHandleToBoundPoint = {
          0: 3,
          1: 0,
          2: 1,
          3: 2,
          4: 4,
          5: 7,
          6: 6,
          7: 5
        };
        for (var i = 0; i < handles.length; i++) {
          var boundPointMatch = linkedBounds.getItem({name: ("boundDot" + mapHandleToBoundPoint[i])});
          handles[i].position = boundPointMatch.position; 
        }                          
      });
    },

    _handlesMouseDown: function(event) {
      var hitResult = paper.project.hitTest(event.point, Defaults.selectHitOptions);
      if (hitResult && hitResult.item.type === "handle") {
        var handle = hitResult.item;
        if (!handle.active) {
          handle.active = true;
          this.activeHandle = handle;
        }
        return true;
      }
      return false;
    },

    _handlesMouseUp: function(event) {
      if (this.activeHandle) {
        this.activeHandle.active = false;
        this.activeHandle = null;
        return true;
      }
      return false;
    },

    _handlesMouseDrag: function(event) {
      if (this.activeHandle) {
        console.log(this.activeHandle);
        var opposingHandle = this.activeHandle.opposite;
        var linkedGeometry = opposingHandle.linkedBounds.linkedGeometry;
        var scales = event.point.subtract(opposingHandle.position)
          .divide(event.lastPoint.subtract(opposingHandle.position));
       
        // TODO: godawful problem with paths not remaining if group is removed
        // so use array of geometry for now...
        for (var i = 0; i < linkedGeometry.length; i++) { 
          linkedGeometry[i].scale(scales.x, scales.y, opposingHandle.position);
        }
        EventManager.handleEvent(linkedGeometry, "scale", [scales.x, scales.y, opposingHandle.position]);      
        return true;
      } 
      return false;
    }
  });

  return SelectTool;
});
