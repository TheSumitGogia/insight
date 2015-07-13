define([
  "paper",
  "underscore",
  "config/Defaults"
], function(paper, _, Defaults) {
  
  var BaseTool = {

    // NOTE: buggy, not in use
    addMouseEvent: function(eventName, matchData, callback) {
      if (!(eventName === "mouseLeave" || 
        eventName === "mouseEnter" || 
        eventName === "mouseMove" || 
        eventName === "mouseDrag" ||
        eventName === "mouseDown" ||
        eventName === "mouseUp" || 
        eventName === "click")) 
      { 
        console.log("Can't add mouse event since event name is illegal");
      }
      
      // assumes that general mouse move code doesn't need to be added
      // that is, it's in the original callback for the tool, now need for specific objects
      var that = this;
      var tool = that; // silly hack because JSHint is dumb
      var paperFunctionName = ["on"] + eventName.capitalizeFirst();
      var oldCallback = tool[paperFunctionName];
      tool[paperFunctionName] = (function() {
        return function(event) {
          console.log(event);
          var matchItems = paper.project.getItems(matchData);
          if (eventName === "mouseMove") {
            var hitResult = paper.project.hitTest(event.point, Defaults.selectHitOptions);
            if (hitResult && hitResult.item.matches(matchData)) {
              callback.apply(hitResult.item, tool, event);
            }
          } else {
            for (var i = 0; i < matchItems.length; i++) {
              callback.apply(matchItems[i], tool, event);
            }
          }
          oldCallback.apply(tool, event);  
        };  
      }());
      console.log(tool.onMouseDown);
    }
    
  };
  return BaseTool;
});
