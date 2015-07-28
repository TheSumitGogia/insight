define([
  "paper",
  "underscore",
  "utils/PaperUtils",
  "objects/Index/BasicIndex"
], function(paper, _, PaperUtils, BasicIndex) {

  var PositionYIndex = _.extend({}, BasicIndex, {
    metric: "position.y",
    type: "numeric",
    data: {}
  });

  return PositionYIndex;
});
