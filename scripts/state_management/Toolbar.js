define([
  "state_management/ToolManager"
], function(ToolManager) {
 
  return function() { 
    console.log("Initializing toolbar behaviors...");

    var toolbar = document.getElementById("toolbar");
    var buttons = toolbar.children;
    
    // NOTE: tricksy usage of "this" keyword here to refer to 
    // clicked button
    for (var i = 0; i < buttons.length; i++) {
      var button = buttons[i];
      button.addEventListener("click", function(event) {
        for (var j = 0; j < buttons.length; j++) {
          buttons[j].className = "button";
        }
        this.className = "button active";
        ToolManager.switchTool(this.name);
      });
    }

  };
});
