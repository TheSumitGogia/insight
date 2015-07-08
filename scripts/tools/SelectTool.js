define([
  "paper",
  "underscore",
  "config/Defaults",
  "utils/PaperUtils",
  "tools/BaseTool"
], function(paper, _, Defaults, PaperUtils, BaseTool) {
  
  var SelectTool = _.extend({}, BaseTool, {

    _downPoint: null,
    _marqee: null,
    _tentative: null,
    selection: null,
    selectionBounds: null,
    selectionHandles: null,

    onMouseDown: function(event) {
      var hitResult = paper.project.hitTest(event.point, Defaults.selectHitOptions);
      
      if (hitResult) {
        if (hitResult.item.selected) { return; }
        console.log("here");
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
        this.selectionBounds.remove();
        this.selectionBounds = null;
        this.selectionHandles.remove();
        this.selectionHandles = null;
      }
    },

    onMouseUp: function(event) {
      if (this.selection) {
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
        this.selectionBounds = PaperUtils.drawBounds(this.selection);
        this.selectionHandles = PaperUtils.drawHandles(this.selectionBounds);
      }
      // TODO: draw handles
      
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

      // translate the polygon to new upper left
      if (deltaX >= 0 && deltaY >= 0) {
        this._marqee.bounds.x = this._downPoint.x;
        this._marqee.bounds.y = this._downPoint.y; 
      } else if (deltaX < 0 && deltaY >= 0) {
        this._marqee.bounds.x = event.point.x;
        this._marqee.bounds.y = this._downPoint.y; 
      } else if (deltaX >= 0 && deltaY < 0) {
        this._marqee.bounds.x = this._downPoint.x;
        this._marqee.bounds.y = event.point.y;
      } else {
        this._marqee.bounds.x = event.point.x;
        this._marqee.bounds.y = event.point.y;
      }
    
    },

    _moveMouseDrag: function(event) {
      var delta = event.point.subtract(event.lastPoint);
      for (var i = 0; i < this.selection.length; i++) {
        this.selection[i].translate(delta.x, delta.y);
      }
      this.selectionBounds.translate(delta.x, delta.y);
      this.selectionHandles.translate(delta.x, delta.y);
    },

    onMouseMove: function(event) {
    
    }

  });
  return SelectTool;
});
