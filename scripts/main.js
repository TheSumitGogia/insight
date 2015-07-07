define([
  "templating/helpers",
  "templating/templating",
  "paper",
  "state_management/SelectionManager",
  "state_management/ToolManager",
  "state_management/ModelManager",
  "Manager"
], function(helpers, templating, paper, SelectionManager, ToolManager, ModelManager, Manager) {
  return function() {

    // create templating tools
    helpers();
    // run templating to create l files
    templating();

    var drawCanvas = document.getElementById("draw-canvas");
    paper.setup(drawCanvas);

    SelectionManager.setManager(Manager);
    ToolManager.setManager(Manager);
    ModelManager.setManager(Manager);

  };
});
