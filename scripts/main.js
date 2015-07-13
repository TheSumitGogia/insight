// note that extensions and StringUtils must be loaded before 
// all the app backend models for function overloading to work properly
define([
  "paper",
  "utils/StringUtils",
  "utils/extensions",
  "templating/helpers",
  "templating/templating",
  "templating/noncanvas",
  "state_management/SelectionManager",
  "state_management/ToolManager",
  "state_management/ModelManager",
  "state_management/PaperManager",
  "Manager"
], function(
  paper,
  StringUtils,
  extensions, 
  helpers, 
  templating, 
  noncanvas, 
  SelectionManager, 
  ToolManager, 
  ModelManager,
  PaperManager, 
  Manager
) {
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
    PaperManager.setupPaper();
  };
});
