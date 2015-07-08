define([
  "paper",
  "underscore",
  "config/Defaults",
  "utils/PaperUtils",
  "utils/ArrayUtils",
  "tools/BaseTool"
], function(paper, _, Defaults, PaperUtils, ArrayUtils, BaseTool) {
  
  var RepresentTool = _.extend({}, BaseTool, {
  
    _lastDownPoint: null,
    _lastDownItem: null,
    _selection: null,

    _matchPoints: function(pointsArray1, pointsArray2) {
      var lines1 = PaperUtils.getLinesBetweenPoints(pointsArray1);
      var lines2 = PaperUtils.getLinesBetweenPoints(pointsArray2); 

      console.log("lines1", lines1);
      console.log("lines2", lines2);

      var lengths1 = PaperUtils.linesToLengths(lines1);
      var lengths2 = PaperUtils.linesToLengths(lines2);
      
      console.log("lengths1", lengths1);
      console.log("lengths2", lengths2);

      var angles1 = PaperUtils.getAnglesBetweenLines(lines1);
      var angles2 = PaperUtils.getAnglesBetweenLines(lines2);

      console.log("angles1", angles1);
      console.log("angles2", angles2);

      // TODO: make sure alignment shift is the same!
      var lengthsAlign = ArrayUtils.testAlignment(lengths1, lengths2);
      var anglesAlign = ArrayUtils.testAlignment(angles1, angles2);
     
      console.log("testLengthAlign", lengthsAlign);
      console.log("testAnglesAlign", anglesAlign);

      return (lengthsAlign && anglesAlign); 
    },

    _matchSegments: function(segmentArr1, segmentArr2) {
      var points1 = ArrayUtils.mapProperty(segmentArr1, "point");
      var points2 = ArrayUtils.mapProperty(segmentArr2, "point");
      var handlesIn1 = ArrayUtils.mapProperty(segmentArr1, "handleIn");
      var handlesIn2 = ArrayUtils.mapProperty(segmentArr2, "handleIn");
      var handlesOut1 = ArrayUtils.mapProperty(segmentArr1, "handleOut");
      var handlesOut2 = ArrayUtils.mapProperty(segmentArr2, "handleOut");

      var flagPointMatch = this._matchPoints(points1, points2);
      var flagHandleInMatch = this._matchPoints(handlesIn1, handlesIn2);
      var flagHandleOutMatch = this._matchPoints(handlesOut1, handlesOut2);

      return (flagPointMatch && flagHandleInMatch && flagHandleOutMatch); 
    },

    testSimilar: function(item1, item2) {
      // invisible copies of items to work on
      var item1copy = item1.clone({insert: false});
      var item2copy = item2.clone({insert: false});
      
      console.log("test items", item1copy, item2copy);
      
      // rescale to setup check for rigid transform
      var pathLength1 = item1copy.length;
      var pathLength2 = item2copy.length;
      var scaleFactor = pathLength1 / pathLength2;
      item2copy.scale(scaleFactor);
      
      // check for rigid transform
      // dist of lines and angles between lines equivalent
      var segments1 = item1copy.segments;
      var segments2 = item2copy.segments;
      
      console.log("test item segments", segments1, segments2);

      var result = this._matchSegments(segments1, segments2);
      item1copy.remove();
      item2copy.remove();
      item1copy = item2copy = null;
      console.log("Similarity:", result);
      return result;
    },

    findSimilar: function(item) {
      // TODO: This is volatile! There should be a good named reference 
      // to the working layer and project paths
      // TODO: also, need to recursively search paths
      var searched = {};
      var similarPaths = [];
      var allPaths = paper.project.layers[0].children;
      for (var i = 0; i < allPaths.length; i++) {
        var checkPath = allPaths[i];
        if (i in searched || checkPath.id == item.id) { continue; }
        if (this.testSimilar(item, checkPath)) {
          similarPaths.push(checkPath);
          searched[i] = true; 
        }
      }
      return similarPaths; 
    },

    onMouseDown: function(event) {
      this._clearSelection();
      
      var hitResult = paper.project.hitTest(event.point, Defaults.selectHitOptions);
      if (!hitResult) { return; } else {  
        this._lastDownPoint = event.point; 
        this._lastDownItem = hitResult.item; 
      }
    },

    _clearSelection: function() {
      if (this._selection) {
        for (var i = 0; i < this._selection.length; i++) {
          this._selection[i].selected = false;
        }
      }
      this._selection = null;
    },

    onMouseUp: function(event) {
      if (this._lastDownPoint) {
        var hitResult = paper.project.hitTest(event.point, Defaults.selectHitOptions);
        if (!hitResult) {
          this._lastDownPoint = null;
          this._lastDownItem = null;
        } else {
          this._lastDownItem.selectedColor = Defaults.representSelectColor;
          this._lastDownItem.selected = true;  
          var similarPaths = this.findSimilar(this._lastDownItem);
          for (var i = 0; i < similarPaths.length; i++) {
            similarPaths[i].selectedColor = Defaults.representSelectColor;
            similarPaths[i].selected = true;
          }
          this._selection = similarPaths;
          this._selection.push(this._lastDownItem);
        }
      }
    },

    onMouseDrag: function(event) {
    
    },

    onMouseMove: function(event) {
    
    }

  });
  return RepresentTool;
});
