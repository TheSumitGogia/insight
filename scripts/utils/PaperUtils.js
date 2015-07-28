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
      return (point1.getDistance(point2) < epsilon);
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
      var max = new paper.Point(bounds.xMax, bounds.yMax);
      return new paper.Point(min.add(max).divide(2));
    },

    getPropByString: function(object, propertyString) {
      if (!propertyString) { return object; }
      var prop, props = propertyString.split(".");
      for (var i = 0; i < props.length - 1; i++) {
        prop = props[i];
        var candidate = object[prop];
        if (candidate !== undefined) {
          object = candidate;
        } else {
          break;
        }
      }
      return object[props[i]];
    },

    distance: function(value1, value2, metricType) {
      switch (metricType) {
        case "numeric":
          console.log("yoyo", value1, value2);
          return Math.abs(value1 - value2);
        case "point":
          return value1.getDistance(value2);
        case "color":
          var labArr1 = this.convertToLAB(value1);
          var labArr2 = this.convertToLAB(value2);
          return this.distance(labArr1, labArr2, "euclid");
        case "euclid":
          var diffArray = value1.map(function(val, index) {
            return val - value2[index];
          });
          var squareArray = diffArray.map(function(val) { return val * val; });
          return squareArray.reduce(function(val1, val2) {
            return val1 + val2;
          });
      }
    },

    convertToLAB: function(color) {
      var linearizeRGBChannel = function(value) {
        if (value > 0.04045) {
          value += 0.055;
          value /= 1.055;
          value = Math.pow(value, 2.4);
        } else {
          value /= 12.92;
        }
        value *= 100;
        return value;
      };

      var linearizeXYZChannel = function(value) {
        if (value > 0.008856) {
          value = Math.pow(value, 0.333);
        } else {
          value = 7.787 * value + 0.138;
        }
        return value;
      };

      var rgbArr = [color.red, color.green, color.blue];
      var linearRGBArr = rgbArr.map(linearizeRGBChannel);
      
      var x = linearRGBArr[0] * 0.4124 + linearRGBArr[1] * 0.3576 + linearRGBArr[2] * 0.1805;
      var y = linearRGBArr[0] * 0.2126 + linearRGBArr[1] * 0.7152 + linearRGBArr[2] * 0.0722;
      var z = linearRGBArr[0] * 0.0193 + linearRGBArr[1] * 0.1192 + linearRGBArr[2] * 0.9505;

      var refX = 95.047;
      var refY = 100.000;
      var refZ = 108.883;

      var normX = x / refX;
      var normY = y / refY;
      var normZ = z / refZ;

      var normXYZArr = [normX, normY, normZ];
      var linXYZArr = normXYZArr.map(linearizeXYZChannel);
      
      var l = linXYZArr[1] * 116 - 16;
      var a = 500 * (linXYZArr[0] - linXYZArr[1]);
      var b = 200 * (linXYZArr[1] - linXYZArr[2]); 

      return [l, a, b]; 
    }
  };


  return PaperUtils;

});
