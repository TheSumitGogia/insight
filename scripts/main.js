define([
  "templating/helpers",
  "templating/templating",
  "templating/noncanvas",
  "paper",
  "state_management/SelectionManager",
  "state_management/ToolManager",
  "state_management/ModelManager",
  "Manager"
], function(helpers, templating, noncanvas, paper, SelectionManager, ToolManager, ModelManager, Manager) {
  return function() {

    // create templating tools
    helpers();
    // run templating to create l files
    templating();
    // initialize all non-canvas UI
    noncanvas();

    var drawCanvas = document.getElementById("draw-canvas");
    paper.setup(drawCanvas);

    SelectionManager.setManager(Manager);
    ToolManager.setManager(Manager);
    ToolManager.setupTools();
    ModelManager.setManager(Manager);

  };
});
