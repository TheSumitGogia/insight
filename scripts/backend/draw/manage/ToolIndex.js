define([
  "paper",
  "underscore",
  "backend/generic/EventsMixin"
], function(paper, _, EventsMixin) {

    var ToolIndex = {

        initial: "search",
        current: null,
        tools: ["search", "select"], 

        setup: function() {
            this.dispatch("setupTools");
            this.addListener("contextSwitch", function(type) {
                if (type == "test") { 
                    this.deactivate(); 
                } else {
                    this.activate();
                }
            });
        },

        activate: function() {
            for (var i = 0; i < this.tools.length; i++) {
                var tool = this.tools[i];
                if (tool == this.initial) { 
                    this.dispatch("activate", tool); 
                } else {
                    this.dispatch("deactivate", tool);
                }
            }
            this.current = this.initial;
        },

        deactivate: function() {
            for (var i = 0; i < this.tools.length; i++) {
                var tool = this.tools[i];
                this.dispatch("deactivate", tool);
            }
            this.current = null; 
        },

        switch: function(tool) {
            this.current = tool;
            this.dispatch("deactivate", tool);
            this.dispatch("activate", tool); 
        }
    };
    _.extend(ToolIndex, EventsMixin);

    return ToolIndex;
});
