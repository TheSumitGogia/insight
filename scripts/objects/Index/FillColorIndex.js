define([
  "paper",
  "underscore",
  "utils/PaperUtils",
  "objects/Index/BasicIndex"
], function(paper, _, PaperUtils, BasicIndex) {

  var FillColorIndex = _.extend({}, BasicIndex, {
    metric: "fillColor",
    type: "color",
    data: {}
  });

  return FillColorIndex;
});
