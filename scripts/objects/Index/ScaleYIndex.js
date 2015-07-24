define([
  "paper",
  "underscore",
  "utils/PaperUtils",
  "objects/Index/BasicIndex"
], function(paper, _, PaperUtils, BasicIndex) {

  var ScaleYIndex = _.extend({
    metric: "bounds.height",
    type: "numeric"
  }, BasicIndex);

  return ScaleYIndex;
});
