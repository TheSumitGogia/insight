define([
    "underscore",
    "backend/draw/manage/ToolIndex",
    "backend/generic/EventsMixin"
], function(_, ToolIndex, EventsMixin) {
 
    var toolbar = $("#toolbar");
    var buttons = toolbar.children();

    var Toolbar = {

        bar: toolbar,
        buttons: buttons,

        initialize: function() {
            this._addListeners();
        },

        setup: function() {
            var startButtonID = "searchTool";
            for (var i = 0; i < this.buttons.length; i++) {
                var button = $(this.buttons[i]);
                if (button.attr('id') === startButtonID) {
                    button.addClass("active");
                } 
            }
        },

        reset: function() {
            for (var i = 0; i < this.buttons.length; i++) {
                var button = $(this.buttons[i]);
                button.removeClass("active");
            }
        },

        activate: function(tool) {
            for (var i = 0; i < this.buttons.length; i++) {
                var button = $(this.buttons[i]);
                var toolName = button.attr('id').slice(0, -4);
                if (toolName == tool) { button.addClass("active"); }
            }
        },

        deactivate: function(tool) {
            for (var i = 0; i < this.buttons.length; i++) {
                var button = $(this.buttons[i]);
                var toolName = button.attr('id').slice(0, -4);
                if (toolName == tool) { button.removeClass("active"); }
            }
        },

        _addListeners: function() {

            // handle mouse events
            for (var i = 0; i < buttons.length; i++) {
                var button = $(this.buttons[i]);
                button.click(function(event) {
                    var toolName = this.attr('id').slice(0, -4);
                    ToolIndex.switch(toolName);
                });
            }

            // handle backend tool changes
            this.addListener("activate", this.activate);
            this.addListener("deactivate", this.deactivate);
            this.addListener("contextSwitch", function(context) {
                if (context == "graphics") {
                    this.setup();
                } else {
                    this.reset();
                }
            });
        }
    };

    Toolbar = _.extend(Toolbar, EventsMixin);

    return Toolbar;
});
