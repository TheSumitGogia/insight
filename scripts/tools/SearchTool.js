define([
  "paper",
  "underscore"

], function(paper, _) {

  var SearchTool = {
    setup: function() {
      // change the panel
      this.request("SelectionManager", "setCurrentSelector", ["search"]);
      
      // make sure index is aware of all metric changes
      // TODO: have this done in a background thread?
      Index.update();
    },

    cleanup: function() {
    
    },
    
    onMouseDown: function(event) {

      // if process hasn't started
      //  check for object
      //  if object
      //    for each selector
      //      get properties + tolerances
      //      ball query on properties+tolerances
      //      for each item in ball query result
      //        add stroke to item with selector color
      //        mark each item for selector expansion
      // else
      //  check for object
      //  if object
      //    if marked for selector expansion
      //      clear previous selector expansion marks
      //      add all items in selector expansion to selection
      //      get distances for each object, sort, label with object id?
      //      for each selector
      //        get props+toelrances
      //        ball query on props+tolerances
      //        for each item in ball query result
      //          add stroke to item with selector color
      //          mark each item for selector expansion
      //    if in expansion
      //      shift
      //        remove item from expansion
      //

    },

    onMouseUp: function(event) {
    
    },

    onMouseMove: function(event) {
    
    },

    addObjectListeners: function() {
      object.onMouseEnter = function(event) {
        var state = this.checkState(object);
        if (!state) {
          this.opacity = 1; // highlight
        } else if (state === "tentative" || state === "expander"){
          this.opacity = 1;
          for (var i = 0; i < this.selectors.length; i++) {
            var selector = this.selectors[i];
            var ball = Index.ballQuery(this, selector.property, selector.tolerance);
            for (var j = 0; j < ball.length; j++) {
              ball[j].opacity = 1;
            }
          }
        }
      };

      object.onMouseLeave = function(event) {
        var state = this.checkState(object);
        if (!state) {
          this.opacity = 0; // remove highlight
        } else if (state === "tentative" || state === "expander") {
          this.opacity = 0.5; // reset to tentative highlight
          for (var i = 0; i < this.selectors.length; i++) {
            var selector = this.selectors[i];
            var ball = Index.ballQuery(this, selector.property, selector.tolerance);
            for (var j = 0; j < ball.length; j++) {
              ball[j].opacity = 0.5;
            }
          }
        }
      };

      object.onClick = function(event) {
      
      }; 

    }
  };

  return SearchTool;


});
