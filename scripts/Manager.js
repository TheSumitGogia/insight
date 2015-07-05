define([
  'paper'
], function(paper) {

  var manageNameMap = {
    'SelectionManager': SelectionManager,
    'ToolManager': ToolManager,
    'ModelManager': ModelManager
  };

  var Manager = {
    
    handleRequest(srcManager, dstManager, method, args) {
      dstManager = manageNameMap[dstManager];
      return dstManager[method].apply(dstManager, args);
    }
  }

  return Manager;
});
