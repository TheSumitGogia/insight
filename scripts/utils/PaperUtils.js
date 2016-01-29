define([
    "paper",
    "underscore"
], function(paper, _) {

    var PaperUtils = {

        // need to test
        getCentroidDists: function(item, numPoints) {
            var pointSample = [];
            for (var i = 0; i < numPoints; i++) {
                var point = item.getPointAt(i / numPoints * item.length);
                pointSample.push(point);
            }
            var centroid = pointSample.reduce(function(p1, p2) { return p1.add(p2); });
            centroid = centroid.divide(numPoints);

            var centroidDistances = pointSample.map(function(point) {
                var dist = point.getDistance(centroid);
                return dist;
            });
            return centroidDistances;
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
        }

    };

    return PaperUtils;
});
