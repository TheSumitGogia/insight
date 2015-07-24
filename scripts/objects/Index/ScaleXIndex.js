define([
  "paper",
  "underscore",
  "utils/PaperUtils",
  "objects/Index/BasicIndex"
], function(paper, _, PaperUtils, BasicIndex) {

  var ScaleXIndex = _.extend({
    metric: "bounds.width",
    type: "numeric"
  }, BasicIndex);

  return ScaleXIndex;
});
