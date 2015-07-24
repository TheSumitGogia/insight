define([
  "paper",
  "underscore",
  "utils/PaperUtils",
  "objects/Index/BasicIndex"
], function(paper, _, PaperUtils, BasicIndex) {

  var StrokeColorIndex = _.extend({
    metric: "strokeColor",
    type: "color"
  }, BasicIndex);

  return StrokeColorIndex;
});
