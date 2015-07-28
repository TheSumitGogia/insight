define([
  "paper",
  "underscore",
  "utils/PaperUtils",
  "objects/Index/BasicIndex"
], function(paper, _, PaperUtils, BasicIndex) {

  var PositionXIndex = _.extend({}, BasicIndex, {
    metric: "position.x",
    type: "numeric",
    data: {}
  });

  return PositionXIndex;
});
