// note that extensions and StringUtils must be loaded before 
// all the app backend models for function overloading to work properly
define([
    "paper",
    "underscore",
    "backend/generic/EventsMixin",
    "backend/draw/manage/ObjectIndex",
    "backend/draw/manage/SelectIndex",
    "backend/draw/manage/ToolIndex",
    "frontend/test/CreateInteraction",
    "frontend/draw/Toolbar",
    "frontend/draw/Drawer",
    "frontend/draw/SearchTool",
    "frontend/draw/SelectTool",
    "semantic"
], function(
    paper,
    _, 
    EventsMixin,
    ObjectIndex,
    SelectIndex,
    ToolIndex,
    CreateInteraction,
    Toolbar,
    Drawer
) {
    var main = function() {
        // handle global window events, setup paper
        var drawCanvas = $("#drawCanvas")[0];
        var winResize = function() {
            var winWidth = $(window).width();
            var winHeight = $(window).height();
            var sidebarWidth = $("#sidebar").width();
            var toolbarHeight = $("#toolbar").height();
            $("#drawContainer").css("width", winWidth - sidebarWidth); // NOTE: pretty hacky
            $("#drawCanvas").css("width", winWidth - sidebarWidth);
            $("#drawCanvas").css("height", winHeight - toolbarHeight);
        };
        winResize(); 
        paper.setup(drawCanvas);
        $(window).resize(winResize);

        // start backend
        ObjectIndex.setup();
        SelectIndex.setup();
        ToolIndex.setup();

        // start test creator
        // TODO: should be start test menu or something
        CreateInteraction.initialize();
        Toolbar.initialize();
        Drawer.initialize();

        // context switching
        var Context = _.extend({
            _current: "test",
            switch: function() {
                var context = this;
                var capture = function(event) {
                    if (context._current == "graphics") {
                        context.switch();
                        event.stopPropagation();
                    }
                };

                if (this._current == "test") {
                    $("#drawContainer").removeClass("inactive");
                    $("#sidebar").get(0).addEventListener("click", capture, true);
                    this._current = "graphics"; 
                    this.dispatch("contextSwitch", "graphics");
                } else {
                    $("#drawContainer").addClass("inactive");
                    //$("#sidebar").get(0).removeEventListener("click", capture, true);
                    this._current = "test";
                    this.dispatch("contextSwitch", "test");
                }
            }
        }, EventsMixin);
        Context.addListener("addTask", Context.switch); 
        Context.addListener("addSteps", Context.switch);
    };

    return main;
});
