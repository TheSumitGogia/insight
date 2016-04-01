define([
    "paper",
    "underscore"
], function(paper, _) {

    var sum = function(arr) {
      return _.reduce(arr, function(cum, item) { return cum + item; });
    };

    var PaperUtils = {

        // need to test
        getCentroidDists: function(item, numPoints) {
            var pointSample = [];
            try {
              for (var i = 0; i < numPoints; i++) {
                  var point = item.getPointAt(i / numPoints * item.length);
                  pointSample.push(point);
              }
            } catch (err) {
              return null;
            }
            var centroid = pointSample.reduce(function(p1, p2) { return p1.add(p2); });
            centroid = centroid.divide(numPoints);

            var centroidDistances = pointSample.map(function(point) {
                var dist = point.getDistance(centroid);
                return dist;
            });
            return centroidDistances;
        },

        avgColor: function(colors) {
          var ncolors = _.map(colors, function(stop) {
            return stop.color;
          });
          var colorSum = _.reduce(ncolors, function(a, b) { 
            return a.add(b); 
          });
          return colorSum.divide(colors.length);
        },

        getAxes: function(item, numPoints) {
            try {
              var pointSample = _.map(_.range(numPoints), function(i) { 
                return item.getPointAt(i * item.length / numPoints);
              }); 
            } catch (err) {
              return null;
            }

            // compute mean-normalized covariance matrix terms
            mPointSample = _.map(pointSample, function(point) { return point.subtract(item.bounds.center); });
            var maps = _.map(mPointSample, function(point) { return [point.x*point.x, point.y*point.y, point.x*point.y]; });
            var splits = _.zip.apply(null, maps);
            var sums = [sum(splits[0]), sum(splits[1]), sum(splits[2])];
            sums = _.map(sums, function(sum) { return sum / pointSample.length; });

            // compute eigenvectors, eigenvalues for scale, orientation
            var trace = (sums[0] + sums[1]);
            var det = (sums[0]*sums[1] - sums[2]*sums[2]);
            var piece1 = trace / 2;
            var piece2 = Math.sqrt(trace*trace / 4 - det);
            var eig1 = (piece1 + piece2);
            var eig2 = (piece1 - piece2);
            var evec1 = [sums[2], eig1 - sums[0]];
            var emag1 = Math.sqrt(evec1[0]*evec1[0] + evec1[1]*evec1[1]);
            evec1 = [evec1[0]/emag1, evec1[1]/emag1];
            var evec2 = [eig2 - sums[1], sums[2]];
            var emag2 = Math.sqrt(evec2[0]*evec2[0] + evec2[1]*evec2[1]);
            evec2 = [evec2[0]/emag2, evec2[1]/emag2];
            var mag1 = Math.sqrt(eig1);
            var mag2 = Math.sqrt(eig2);
            if (eig1 < 0) { mag1 *= -1; }
            if (eig2 < 0) { mag2 *= -1; }
            evec1 = (new paper.Point(evec1)).multiply(mag1);
            evec2 = (new paper.Point(evec2)).multiply(mag2);

            // compute orientation, use signed #numpoints > y=0
            var angle = (new paper.Point([-1, 0])).getAngle(evec1);
            //item.rotate(-angle);
            var nPointSample = _.map(_.range(numPoints), function(i) {
              return item.getPointAt(i * item.length / numPoints);
            });
            var numPosY = (_.filter(nPointSample, function(p) { return p.y >= 0; })).length;
            //item.rotate(angle);
            if (numPosY < numPoints / 2) { angle += 180; }

            /* test
            // draw points on path boundary
            _.each(pointSample, function(point) {
              var testCirc = new paper.Path.Circle(point, 1);
              testCirc.fillColor = 'blue';
            });

            // draw scaled eigenvectors
            var axes1 = new paper.Path.Line(item.bounds.center, item.bounds.center.add(evec1));
            var axes2 = new paper.Path.Line(item.bounds.center, item.bounds.center.add(evec2));
            axes1.strokeColor = 'red';
            axes1.strokeWidth = 2;
            axes2.strokeColor = 'red';
            axes2.strokeWidth = 2;

            // draw oriented box
            var rect = new paper.Path.Rectangle(item.bounds.center.x, item.bounds.center.y, 1, 1);
            rect.position = item.bounds.center;
            rect.scale(mag1, mag2);
            rect.rotate(-angle);
            rect.strokeColor = 'blue';
            rect.fillColor = null;
            */
            
            return [evec1, evec2];
        },

        convertToLAB: function(color) {
            if (!color) { return false; }
            if (color.type === "gradient") {
              color = this.avgColor(color.stops);
            }

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
