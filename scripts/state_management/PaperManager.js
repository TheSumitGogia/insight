define([
  "paper",
  "jquery",
  "state_management/SelectionManager",
  "state_management/Clipboard",
  "utils/PaperUtils",
  "jquery-mousewheel"
], function(paper, $, SelectionManager, Clipboard, PaperUtils) {
  
  var PaperManager = {
 
    zoom: 1,
    pan: null,

    _manager: null,

    panXKey: false,
    panYKey: false,
    zoomKey: false,
    deleteKey: {code: 46, value: false},
    clearKey: {code: 35, value: false},
    cutKey: {code: [17, 88], value: [false, false]},
    copyKey: {code: [17, 67], value: [false, false]},
    pasteKey: {code: [17, 86], value: [false, false]}, 

    setup: function() {
      this.pan = paper.view.center;
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

    deleteItems: function(selection) {
      for (var i = 0; i < selection.length; i++) {
        var item = selection[i];
        item.remove();
        item = null;
      }
      SelectionManager.removeSelection(selection.name); 
    },

    clear: function() {
      this._manager.clearState();
    },
    
    cutItems: function(selection) {
      this.copyItems(selection);
      this.deleteItems(selection);
    },

    copyItems: function(selection) {
      var copySelection = selection.map(function(item) {
        return item.clone();
      });
      Clipboard.set(copySelection); 
    },

    pasteItems: function(point) {
      var items = Clipboard.get();
      var itemClones = items.map(function(item) {
        return item.clone();
      });
      paper.project.activeLayer.addChildren(itemClones);
      var oldCenter = PaperUtils.getCenter(itemClones);
      var translateDelta = point.subtract(oldCenter);
      for (var i = 0; i < items.length; i++) {
        items.translate(translateDelta);
      }
    },

    setManager: function(manager) {
      this._manager = manager;
    },

    request: function(managerName, method, args) {
      this._manager.handleRequest(managerName, method, args);
    }
  };

  return PaperManager;

});
