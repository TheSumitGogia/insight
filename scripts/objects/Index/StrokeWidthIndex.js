define([
  "paper",
  "underscore",
  "utils/PaperUtils",
  "objects/Index/BasicIndex"
], function(paper, _, PaperUtils, BasicIndex) {

  var StrokeWidthIndex = _.extend({
    metric: "strokeWidth",
    type: "numeric",
    data: {}
  }, BasicIndex);

  return StrokeWidthIndex;
});
