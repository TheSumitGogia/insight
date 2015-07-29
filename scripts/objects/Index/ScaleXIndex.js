define([
  "paper",
  "underscore",
  "utils/PaperUtils",
  "objects/Index/BasicIndex"
], function(paper, _, PaperUtils, BasicIndex) {

  var ScaleXIndex = _.extend({}, BasicIndex, {
    metric: "bounds.width",
    type: "numeric",
    data: {}
  });

  return ScaleXIndex;
});
