define([
  "paper",
  "underscore",
  "utils/PaperUtils",
  "objects/Index/BasicIndex"
], function(paper, _, PaperUtils, BasicIndex) {

  var StrokeColorIndex = _.extend({}, BasicIndex, {
    metric: "strokeColor",
    type: "color",
    data: {}
  });

  return StrokeColorIndex;
});
