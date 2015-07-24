define([
  "paper",
  "underscore",
  "utils/PaperUtils",
  "objects/Index/BasicIndex"
], function(paper, _, PaperUtils, BasicIndex) {

  var OpacityIndex = _.extend({
    metric: "opacity",
    type: "numeric"
  }, BasicIndex);

  return OpacityIndex;
});
