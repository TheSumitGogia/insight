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
    _marquee: null,
    _tentative: null,
    _handles: null,
    _activeHandle: null,
    _bounds: null,

    setup: function() {
      this.request("SelectionManager", "setCurrentSelector", ["marquee"]);  
    },

    cleanup: function() {
      if (this._marquee) {
        this._marquee.remove();
        this._marquee = null;
      }
      this._tentative = null;
      this._downPoint = null;
      if (this._handles) {
        for (var i = 0; i < this._handles.length; i++) {
          this._handles[i].remove();
        }
        this._activeHandle = null;
      }
      if (this._bounds) {
        this._bounds.remove();
        this._bounds = null;
      }
    },

    onMouseDown: function(event) {
      var breakFlag = this._handlesMouseDown(event);
      if (breakFlag) { return; }

      var hitResult = paper.project.hitTest(event.point, Defaults.selectHitOptions);
      var rmvSuccess = false; 
      if (hitResult) {
        if (hitResult.item.selected) { return; }
        // this._clearSelection();
        rmvSuccess = this.request("SelectionManager", "removeSelection", ["marquee"]);
        if (rmvSuccess) {
          this._removeSelectionUI();
        }
        this._downPoint = event.point;
        this._tentative = hitResult.item;
      } else {
        rmvSuccess = this.request("SelectionManager", "removeSelection", ["marquee"]);
        if (rmvSuccess) {
          this._removeSelectionUI();
        }
        // this._clearSelection(); 
      } 
    },
    
    _clearSelection: function() {
      /*if (this.selection) {
        for (var i = 0; i < this.selection.length; i++) {
          this.selection[i].selected = false;
        }
      }
      this.selection = null;
      if (this._bounds) {
        this._bounds.remove();
        this._bounds = null;
        for (var j = 0; j < this._handles.length; j++) {
          this._handles[j].remove();
        }
        this._handles = null;
      }*/

      var success = this.request("SelectionManager", "removeSelection", ["marquee"]);
      if (success) {
        this._removeSelectionUI();
      }
    },

    _removeSelectionUI: function() {
      this._removeBounds();
      this._removeHandles();
    },

    _removeBounds: function() {
      this._bounds.remove();
      this._bounds = null;
    },

    _removeHandles: function() {
      for (var i = 0; i < this._handles.length; i++) {
        this._handles[i].remove();
      }
      this._handles = null;
    },

    onMouseUp: function(event) {
      var check = this.request("SelectionManager", "hasSelection", ["marquee"]);
      if (check) {
        var breakFlag = this._handlesMouseUp(event);
        if (breakFlag) { return; }
        this._moveMouseUp(event);
      } else {
        this._marqueeMouseUp(event);
      }
    },
    
    _marqueeMouseUp: function(event) {
      if (PaperUtils.tolerance(event.point, this._downPoint, 2)) {
        if (this._tentative) {
          this.request("SelectionManager", "createSelection", ["marquee", [this._tentative]]);
          //this.selection = [this._tentative];  
        }
      } else {
        var marquee = this._marquee;
        this.request("SelectionManager", "createSelection", ["marquee", paper.project.getItems({
          bounds: function(bounds) {
            var topLeftCheck = bounds.topLeft.x > marquee.bounds.topLeft.x && 
              bounds.topLeft.y > marquee.bounds.topLeft.y;
            var bottomRightCheck = bounds.bottomRight.x < marquee.bounds.bottomRight.x && 
              bounds.bottomRight.y < marquee.bounds.bottomRight.y;
            return (topLeftCheck && bottomRightCheck);
          }
        })]);
        /*this.selection = paper.project.getItems({
          bounds: function(bounds) {
            var topLeftCheck = bounds.topLeft.x > marquee.bounds.topLeft.x && 
              bounds.topLeft.y > marquee.bounds.topLeft.y;
            var bottomRightCheck = bounds.bottomRight.x < marquee.bounds.bottomRight.x && 
              bounds.bottomRight.y < marquee.bounds.bottomRight.y;
            return (topLeftCheck && bottomRightCheck);
          }
        });*/
      }
      if (this._marquee) { this._marquee.remove(); }
      this._downPoint = this._tentative = this._marquee = null;
      // if (this.selection) {
      var selection = this.request("SelectionManager", "getSelection", ["marquee"]);
      if (selection) {
        this.createBounds(selection);
        this.createHandles(this._bounds);
      }
    },

    _moveMouseUp: function(event) {
    
    },

    onMouseDrag: function(event) {
      if (this.request("SelectionManager", "hasSelection", ["marquee"])) {
        this._moveMouseDrag(event);
      } else {
        this._marqueeMouseDrag(event);
      }
    },

    _marqueeMouseDrag: function(event) {
      // if marquee hasn't been created, create it!
      if (!this._marquee) {
        this._marquee = new paper.Path.Rectangle(this._downPoint, new paper.Size(1, 1));
        this._marquee.style = Defaults.selectionBoundsStyle;
      }
      // check how much mouse moved from start
      var deltaX = event.point.x - this._downPoint.x;
      var deltaY = event.point.y - this._downPoint.y;
     
      // scale the polygon back to new desired size
      var widthScale = Math.abs(deltaX) / this._marquee.bounds.width;
      var heightScale = Math.abs(deltaY) / this._marquee.bounds.height;
      var scalePoint = this._marquee.bounds.topLeft;
      if (widthScale > 0 && heightScale > 0) { 
        this._marquee.scale(widthScale, heightScale, scalePoint);
      }

      // reposition the marquee to the new center
      this._marquee.position = event.point.add(this._downPoint).divide(2);
    },

    _moveMouseDrag: function(event) {
      var breakFlag = this._handlesMouseDrag(event);
      if (breakFlag) { return; }
      
      var delta = event.point.subtract(event.lastPoint);
      var selection = this.request("SelectionManager", "getSelection", ["marquee"]);
      for (var i = 0; i < selection.length; i++) {
        selection[i].translate(delta.x, delta.y);
      }
      this._bounds.translate(delta.x, delta.y);
      for (var j = 0; j < this._handles.length; j++) {
        this._handles[j].translate(delta.x, delta.y);
      }
    },

    onMouseMove: BaseTool.onMouseMove,

    createBounds: function(paths) {
      var corners = PaperUtils.getBounds(paths); 
      var boundsSize = new paper.Size(corners.xMax - corners.xMin, corners.yMax - corners.yMin);
      var bounds = new paper.Path.Rectangle(new paper.Point(corners.xMin, corners.yMin), boundsSize);
      bounds.style = Defaults.boundsStyle;

      var linComboArray = [[0, 0], [0.5, 0], [1, 0], [0, 0.5], [1, 0.5], [0, 1], [0.5, 1], [1, 1]];
      var boundsPointForm = new paper.Point(boundsSize.width, boundsSize.height);
      var boundDots = [];
      for (var i = 0; i < linComboArray.length; i++) {
        var linCombo = new paper.Point(linComboArray[i]);
        var dotPoint = linCombo.multiply(boundsPointForm).add(new paper.Point(corners.xMin, corners.yMin));
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
      boundsGroup.bringToFront();
      // actually just redraws dots
      boundsGroup.redraw = function() {
        for (var i = 0; i < linComboArray.length; i++) {
          var ncorners = PaperUtils.getBounds(this.linkedGeometry); 
          var nBoundsSize = new paper.Size(ncorners.xMax - ncorners.xMin, ncorners.yMax - ncorners.yMin);
          var scaleF = nBoundsSize.divide(this.children[0].bounds.size);
          this.children[0].scale(scaleF.width, scaleF.height);
          var newCenter = new paper.Point((ncorners.xMax + ncorners.xMin) / 2, (ncorners.yMax + ncorners.yMin) / 2);

          this.children[0].position = newCenter; 
          var linCombo = new paper.Point(linComboArray[i]);
          var boundsPointForm = new paper.Point(nBoundsSize.width, nBoundsSize.height);
          var dotPoint = linCombo.multiply(boundsPointForm).add(new paper.Point(ncorners.xMin, ncorners.yMin));
          boundDots[i].position = dotPoint;
        } 
      };
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
      scaleHandles.redraw = function() {
        for (var i = 0; i < this.length; i++) {
          var boundPointMatch = bounds.getItem({name: ("boundDot" + mapHandleToBoundPoint[i])});
          this[i].position = boundPointMatch.position; 
        }                          
      };

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
        var opposingHandle = this.activeHandle.opposite;
        var linkedGeometry = opposingHandle.linkedBounds.linkedGeometry;
        var scales = event.point.subtract(opposingHandle.position)
          .divide(event.lastPoint.subtract(opposingHandle.position));
        if (this.activeHandle.position.x === opposingHandle.position.x) { scales.x = 1; }
        if (this.activeHandle.position.y === opposingHandle.position.y) { scales.y = 1; } 
        // TODO: godawful problem with paths not remaining if group is removed
        // so use array of geometry for now...
        for (var i = 0; i < linkedGeometry.length; i++) { 
          linkedGeometry[i].scale(scales.x, scales.y, opposingHandle.position);
        }
        this._bounds.redraw();
        this._handles.redraw();
        return true;
      } 
      return false;
    }
  });

  return SelectTool;
});
