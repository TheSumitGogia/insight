define([
  "paper",
  "underscore",
  "utils/PaperUtils",
  "objects/Index/BasicIndex"
], function(paper, _, PaperUtils, BasicIndex) {

  var ScaleYIndex = _.extend({}, BasicIndex, {
    metric: "bounds.height",
    type: "numeric",
    data: {}
  });

  return ScaleYIndex;
});
