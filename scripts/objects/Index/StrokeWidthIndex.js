define([
  "paper",
  "underscore",
  "utils/PaperUtils",
  "objects/Index/BasicIndex"
], function(paper, _, PaperUtils, BasicIndex) {

  var StrokeWidthIndex = _.extend({}, BasicIndex, {
    metric: "strokeWidth",
    type: "numeric",
    data: {}
  });

  return StrokeWidthIndex;
});
