define([
  "paper",
  "underscore",
  "tools/BaseTool"
], function(paper, _, BaseTool) {
  
  var BaseCreateTool = _.extend({}, BaseTool, {
    onMouseMove: BaseTool.onMouseMove,   
    setup: function() {
      this.request("SelectionManager", "removeAllSelections", []);
    }
  });
  return BaseCreateTool;
});
