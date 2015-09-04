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
          return Math.abs(value1 - value2);
        case "point":
          return value1.getDistance(value2);
        case "color":
          if (!value1 && !value2) { return 0; } // TODO: equal color constant
          if (!(value1 && value2)) { return 9000; } // TODO: max color constant (infty)
          var labArr1 = this.convertToLAB(value1);
          var labArr2 = this.convertToLAB(value2);
          return this.distance(labArr1, labArr2, "euclid");
        case "euclid":
          var diffArray = value1.map(function(val, index) {
            return val - value2[index];
          });
          var squareArray = diffArray.map(function(val) { return val * val; });
          var squareDist = squareArray.reduce(function(val1, val2) {
            return val1 + val2;
          });
          return Math.sqrt(squareDist);
      }
    },

    convertToLAB: function(color) {
      if (!color || color.type === "gradient") { return false; }

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
    },

    randInt: function(start, end) {
      return Math.floor(Math.random() * (end - start + 1)) + start; 
    },

    random: function(property) {
      var rand;
      switch (property) {
        case "fillColor":
          rand = [
            Math.random() * this.spaceVariances.fillColor[0],
            Math.random() * this.spaceVariances.fillColor[1],
            Math.random() * this.spaceVariances.fillColor[2]  
          ];
          break;
        case "strokeColor":
          rand = [
            Math.random() * this.spaceVariances.strokeColor[0],
            Math.random() * this.spaceVariances.strokeColor[1],
            Math.random() * this.spaceVariances.strokeColor[2]
          ];
          break;
        case "scale":
          rand = [
            Math.random() * this.spaceVariances.scale[0] + 20,
            Math.random() * this.spaceVariances.scale[1] + 20
          ];
          break;
        case "position":
          rand = [
            Math.random() * this.spaceVariances.position[0],
            Math.random() * this.spaceVariances.position[1]
          ];
          break;
        case "rotation":
          rand = Math.random() * this.spaceVariances.rotation;
          break;
        case "strokeWidth":
          rand = Math.random() * this.spaceVariances.strokeWidth;
          break;
      }
      return rand;  
    },

    // need to test
    getCentroidDists: function(item, numPoints) {
      var pointSample = [];
      for (var i = 0; i < numPoints; i++) {
        var point = item.getPointAt(i / numPoints * item.length);
        /*
        var pCircle = paper.Path.Circle(point, 2);
        pCircle.strokeColor = "red";
        pCircle.strokeWidth = 1;
        */
        pointSample.push(point);
      }
      var centroid = pointSample.reduce(function(p1, p2) { return p1.add(p2); });
      centroid = centroid.divide(numPoints);
     
      /* 
      var globalMaxDist = 0;
      for (var j = 0; j < pointSample.length;j++) {
        var point = pointSample[j];
        var testLine = paper.Path.Line(point, centroid);
        var testSize = paper.view.height + paper.view.width;
        testLine.scale(testSize, point);
        var intersects = testLine.getIntersections(item);
        intersects = intersects.map(function(cloc) { return cloc.point; });
        var intersectDists = intersects.map(function(inter) { return point.getDistance(inter); });
        var maxDist = Math.max.apply(null, intersectDists);
        if (maxDist > globalMaxDist) {
          globalMaxDist = maxDist;
          
          // TODO: get secondary axis
        } 
        testLine.remove();
        testLine = null;
      }
      */

      /*
      var cCircle = paper.Path.Circle(centroid, 2);
      cCircle.strokeColor = "green";
      cCircle.strokeWidth = 1;
      */
      var centroidDistances = pointSample.map(function(point) {
        var dist = point.getDistance(centroid);
        /*
        if (point.x < centroid.x) {
          dist = -dist;
        }
        */
        return dist;
      });
      /*
      var geomFeatures = {
        centroid: centroid,
        centroidDistances: centroidDistances,
        primaryAxis: globalMaxDist
      }
      */
      return centroidDistances;
    },

    setProperties: function(shape, properties) {
      for (var property in properties) {
        if (properties.hasOwnProperty(property)) {
          var propVal = properties[property];
          if (properties.hasOwnProperty(property)) {
            if (property === "fillColor" || property === "strokeColor") {
              var newColor = new paper.Color(0, 0, 0);
              newColor.hue = propVal[0];
              newColor.saturation = propVal[1];
              newColor.lightness = propVal[2];
              var styleObj = {};
              styleObj[property] = newColor;
              shape.style = styleObj;
            }
            if (property === "scale") {
              var currWidth = shape.bounds.width;
              var currHeight = shape.bounds.height;
              shape.scale(propVal[0] / currWidth, propVal[1] / currHeight);
            }
            if (property === "rotation") {
              var currAngle = shape.rotation;
              shape.rotate(propVal - currAngle);
            }
            if (property === "position") {
              var currPos = shape.position;
              shape.translate(currPos.x - propVal[0], currPos.y - propVal[1]);
            }
            if (property === "strokeWidth") {
              var styleObject = {};
              styleObject[property] = propVal;
              shape.style = styleObject; 
            }
          }
        }
      }
    },

    extractFeatures: function(objects, extractor) {
      var featureReps = {};
      for (var i = 0; i < objects.length; i++) {
        var object = objects[i];
        var features = extractor.extract(object);
        featureReps[object.identifier] = features;
      }
      return featureReps; 
    },

    spaceVariances: {
      fillColor: [360, 1, 1],
      strokeColor: [360, 1, 1],
      scale: [100, 100],
      position: [1000, 1000],
      strokeWidth: 8,
      shape: 9,
      rotation: [360] 
    }
  };


  return PaperUtils;

});
