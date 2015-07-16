define([
  "paper",
  "underscore",
  "config/Defaults",
  "utils/PaperUtils",
  "objects/Geometry",
  "state_management/EventsMixin"
], function(paper, _, Defaults, PaperUtils, Geometry, EventsMixin) {
  
  var HandlesExtension = {
    _bounds: null,
    _mapHandleToBoundPoint: null,
    _activeHandle: null,

    redraw: function() { 
      for (var i = 0; i < this.length; i++) {
        var boundPointMatch = this._bounds.getItem({name: ("boundDot" + this._mapHandleToBoundPoint[i])});
        this[i].position = boundPointMatch.position; 
      }                          
    },

    addListeners: function() {
      this.addListener(this._bounds, "redraw", this.redraw);  
    }
  };

  var Handles = function(bounds) {
    
    var scaleHandle = new Geometry.Path([
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
      newHandle.type = "ui";
      newHandle.name = "handle";
      scaleHandles.push(newHandle);
    }
    for (var j = 0; j < 8; j++) {
      scaleHandles[j].opposite = scaleHandles[(j + 4) % 8];
      scaleHandles[j].linkedBounds = bounds;
      scaleHandles[j].bringToFront();
    } 
    
    var handlesProperties = {
      _bounds: bounds,
      _mapHandleToBoundPoint: mapHandleToBoundPoint,
      type: "ui",
      name: "handles"
    };

    _.extend(scaleHandles, EventsMixin, HandlesExtension, handlesProperties);
    scaleHandles.addListeners();
    return scaleHandles;
  };

  return Handles;
});
