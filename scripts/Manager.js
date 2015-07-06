define([
  "paper",
  "state_management/SelectionManager",
  "state_management/ToolManager",
  "state_management/ModelManager"
], function(paper, SelectionManager, ToolManager, ModelManager) {

  var manageNameMap = {
    "SelectionManager": SelectionManager,
    "ToolManager": ToolManager,
    "ModelManager": ModelManager
  };

  var Manager = {
    
    handleRequest: function(srcManager, dstManager, method, args) {
      dstManager = manageNameMap[dstManager];
      return dstManager[method].apply(dstManager, args);
    }
  };

  return Manager;
});
