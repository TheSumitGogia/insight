define([
  "paper",
  "underscore",
  "config/Defaults",
  "utils/MathUtils"
], function(paper, _, Defaults, MathUtils) {
  
  var PaperUtils = {
    
    getLinesBetweenPoints: function(pointsArray) {
      var lineArray = pointsArray.reduce(
        function(prevLineArray, currPoint, ind, pointsArr) {
          var prevPoint = ind === 0 ? pointsArr[pointsArr.length - 1] : pointsArr[ind - 1];
          prevLineArray.push(currPoint.subtract(prevPoint));
          return prevLineArray;
        },
        []  
      );
      return lineArray; 
    },

    getAnglesBetweenLines: function(linesArray) {
      var angleArray = linesArray.reduce(
        function(prevAngleArray, currLine, ind, linesArr) {
          var prevLine = ind === 0 ? linesArr[linesArr.length - 1] : linesArr[ind - 1];
          prevAngleArray.push(currLine.angle - prevLine.angle);
          return prevAngleArray;
        },
        []
      );
      return this.normalizeAngles(angleArray); 
    },

    linesToLengths: function(linesArray) {
      return linesArray.map(function(line) { return line.length; });
    },

    normalizeAngles: function(angles) {
      return angles.map(function(angle) {
        var normAngle = (angle <= 0) ? (360 + angle) : angle;
        return normAngle;
      });
    },

    randomPoint: function() {
      var canvas = paper.view.element;
      var x = Math.floor(Math.random() * canvas.offsetWidth);
      var y = Math.floor(Math.random() * canvas.offsetHeight);
      return new paper.Point(x, y); 
    },

    randomColor: function() {
      return "#" + Math.floor(Math.random() * 16777215).toString(16);
    },

    tolerance: function(point1, point2, epsilon) {
      var xCheck = MathUtils.tolerance(point1.x, point2.x, epsilon);
      var yCheck = MathUtils.tolerance(point1.y, point2.y, epsilon);
      return (xCheck && yCheck);
    },

    drawBounds: function(paths) {
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
      boundsGroup.bringToFront();
      return boundsGroup;
    },

    drawHandles: function(bounds) {
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
        console.log("boundPoint", boundPointMatch.position);
        newHandle.position = boundPointMatch.position; 
        scaleHandles.push(newHandle);
      }

      var handlesGroup = new paper.Group(scaleHandles);
      handlesGroup.type = "ui";
      handlesGroup.name = "handles";
      handlesGroup.bringToFront();
      return handlesGroup;

    }
  };


  return PaperUtils;

});
