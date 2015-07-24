define([
  "paper",
  "underscore",
  "utils/PaperUtils",
  "objects/Index/BasicIndex"
], function(paper, _, PaperUtils, BasicIndex) {

  var PositionXIndex = _.extend({
    metric: "position.x",
    type: "numeric"
  }, BasicIndex);

  return PositionXIndex;
});
