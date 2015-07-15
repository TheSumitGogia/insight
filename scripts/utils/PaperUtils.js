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

    getBounds: function(paths) {
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
      return {xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax};
    },

    getCenter: function(paths) {
      var bounds = this.getBounds(paths);
      var min = new paper.Point(bounds.xMin, bounds.yMin);
      var max = new paper.Point(bounds.xMas, bounds.yMax);
      return new paper.Point(min.add(max).divide(2));
    }

  };


  return PaperUtils;

});
