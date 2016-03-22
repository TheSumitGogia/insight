define([
  "paper",
  "underscore",
  "backend/generic/EventsMixin",
  "utils/PaperUtils"
], function(paper, _, EventsMixin, PaperUtils) {

  var PathExtension = {
    extractFeatures: function() {
      var features = {};
      var numSamplePoints = 64;
      features["shape"] = PaperUtils.getCentroidDists(this, numSamplePoints);
      features["strokeColor"] = PaperUtils.convertToLAB(this.strokeColor);
      features["fillColor"] = PaperUtils.convertToLAB(this.fillColor);
      features["strokeWidth"] = this.strokeWidth; 
      features["position"] = [this.position.x, this.position.y];
      features["scale"] = [this.bounds.width, this.bounds.height];

      // handle no stroke case
      if (!features["strokeColor"]) {
        features["strokeColor"] = features["fillColor"];   
        features["strokeWidth"] = 0;
      }
      return features;
    }
  };

  var PathPrototype = _.extend({}, paper.Path.prototype, EventsMixin, PathExtension);

  var Path = function(paperPath) {
    _.extend(paperPath, EventsMixin, PathExtension);
    paperPath.prototype = PathPrototype;
    paperPath.features = paperPath.extractFeatures(); 
    return paperPath;
  };

  return Path;
});
