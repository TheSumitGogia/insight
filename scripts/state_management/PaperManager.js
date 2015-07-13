define([
  "paper",
  "jquery",
  "jquery-mousewheel"
], function(paper, $) {
  
  var PaperManager = {
 
    zoom: 1,
    pan: null,

    _manager: null,

    panXKey: false,
    panYKey: false,
    zoomKey: false,

    setupPaper: function() {
      var that = this;
      var canvas = $("#draw-canvas");
      this.pan = paper.view.center;
      // WARNING: These events could conflict with some tool UI!
      canvas.mousewheel(function(event) {
        if (that._panYKey) {
          that.stepCenter(event.deltaX, event.deltaY, event.deltaFactor);
          event.preventDefault();
        } else if (that._panXKey) {
          that.stepCenter(event.deltaY, event.deltaX, event.deltaFactor);
          event.preventDefault(); 
        } else if (that._zoomKey) {
          var mousePosition = new paper.Point(event.offsetX, event.offsetY);
          var viewPosition = paper.view.viewToProject(mousePosition);
          that.stableStepZoom(event.deltaY, viewPosition);  
          event.preventDefault();
          paper.view.draw();
        }
      }); 

      $(window).keydown(function(event) {
        if (event.which == 65) {
          that._panXKey = true;
          that._panYKey = that._zoomKey = false;
        }
        if (event.which == 83) {
          that._panYKey = true;
          that._panXKey = that._zoomKey = false;
        }
        if (event.which == 68) {
          that._zoomKey = true;
          that._panXKey = that._panYKey = false;
        }
      });

      $(window).keyup(function(event) {
        if (event.which == 65) {
          that._panXKey = false;
        } 
        if (event.which == 83) {
          that._panYKey = false;
        }
        if (event.which == 68) {
          that._zoomKey = false;
        }
      }); 
    },

    setZoom: function(zoomValue) {
      this.zoom = zoomValue;
      paper.view.zoom = zoomValue;
    },

    stepZoom: function(delta) {
      var zoomStep = 1.05;
      if (delta < 0) {
        this.zoom = this.zoom * zoomStep; 
      } else if (delta > 0) {
        this.zoom = this.zoom / zoomStep;
      }
      paper.view.zoom = this.zoom; 
    },

    stableStepZoom: function(delta, point) {
      var oldZoom = this.zoom;
      this.stepZoom(delta);
      var newZoom = this.zoom;
      var scaleF = oldZoom / newZoom;
      var paperOffset = point.subtract(paper.view.center);
      var translateOffset = point.subtract(paperOffset.multiply(scaleF)).subtract(paper.view.center);
      this.zoom = paper.view.zoom = newZoom;
      this.pan = paper.view.center = paper.view.center.add(translateOffset);
    },

    setCenter: function(point) {
      this.pan = point;
      paper.view.center = point;
    },
       
    stepCenter: function(deltaX, deltaY, factor) {
      var offset = new paper.Point(deltaX, -deltaY);
      offset = offset.multiply(factor);
      this.pan = this.pan.add(offset);
      paper.view.center = paper.view.center.add(offset);
    },

    setManager: function(manager) {
      this._manager = manager;
    }
  };

  return PaperManager;

});
