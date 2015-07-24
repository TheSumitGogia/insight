define([
  "paper",
  "underscore",
  "utils/PaperUtils",
  "objects/Index/BasicIndex"
], function(paper, _, PaperUtils, BasicIndex) {

  var FillColorIndex = _.extend({
    metric: "fillColor",
    type: "color"
  }, BasicIndex);

  return FillColorIndex;
});
