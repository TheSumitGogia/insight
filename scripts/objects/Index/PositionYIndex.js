define([
  "paper",
  "underscore",
  "utils/PaperUtils",
  "objects/Index/BasicIndex"
], function(paper, _, PaperUtils, BasicIndex) {

  var PositionYIndex = _.extend({
    metric: "position.y",
    type: "numeric"
  }, BasicIndex);

  return PositionYIndex;
});
