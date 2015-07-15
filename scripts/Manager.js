define([
  "paper",
  "state_management/SelectionManager",
  "state_management/ToolManager",
  "state_management/ModelManager",
  "state_management/PaperManager"
], function(paper, SelectionManager, ToolManager, ModelManager, PaperManager) {

  var manageNameMap = {
    "SelectionManager": SelectionManager,
    "ToolManager": ToolManager,
    "ModelManager": ModelManager,
    "PaperManager": PaperManager
  };

  var Manager = {
    
    handleRequest: function(dstManager, method, args) {
      dstManager = manageNameMap[dstManager];
      return dstManager[method].apply(dstManager, args);
    }
  };

  return Manager;
});
