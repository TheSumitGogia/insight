define([
  "paper",
  "state_management/SelectionManager",
  "state_management/ToolManager",
  "state_management/ModelManager",
  "Manager"
], function(paper, SelectionManager, ToolManager, ModelManager, Manager) {
  return function() {
    var drawCanvas = document.getElementById("draw-canvas");
    paper.setup(drawCanvas);

    SelectionManager.setManager(Manager);
    ToolManager.setManager(Manager);
    ModelManager.setManager(Manager);
  };
});
