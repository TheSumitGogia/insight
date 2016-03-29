define([
  "underscore",
  "jquery",
  "frontend/tools/SearchTool",
  "frontend/tools/SelectTool",
  "backend/generic/EventsMixin"
], function(
  _,
  $,
  SearchTool,
  SelectTool,
  EventsMixin
) {
  var defaultTool = "search";

  // map of tool names to buttons and tool objects
  var tools = {
    search: { button: $("#searchTool"), tool: SearchTool },
    select: { button: $("#selectTool"), tool: SelectTool }
  };

  // initialize each of the paper tools
  var createTools = function() {
    _.each(tools, function(tool, toolName) {
      tools[toolName].tool = tool.tool.create();
    });
  };

  // get tool name from button id
  var trimID = function(buttonID) {
    return buttonID.substring(0, buttonID.length - 4);
  };

  var Toolset = {

    current: null,
    start: function() {
      console.log("Starting toolbar");
      var bar = this;

      // create tools
      createTools();

      // listeners for buttons
      _.each(tools, function(tool, toolName) {
        tool.button.click(function(event) {
          _.each(tools, function(tool, toolName) { bar.deactivate(toolName); });
          bar.activate(trimID($(this).attr('id')));
          bar.current = toolName;
        });
      });

      // listeners for outside ui
      this.addListener("loadGraphics", function(image) {
        tools["search"].tool.image = image; 
        bar.reset(true);
      });

      bar.current = defaultTool; 
      tools["search"].tool.start();
      this.dispatch("toolSwitch", "search");
    },

    reset: function(noload) {
      console.log("Resetting toolbar");
      var bar = this;
      _.each(tools, function(tool, toolName) {
        bar.deactivate(toolName);
      });
      bar.activate(defaultTool, noload);
      bar.current = defaultTool;
      this.dispatch("toolSwitch", "search");
    },

    activate: function(toolName, noload) {
      console.log("Activating tool:", toolName);
      tools[toolName].button.addClass("active");
      tools[toolName].tool.start(noload);
      this.dispatch("toolSwitch", toolName);
    },

    deactivate: function(toolName) {
      console.log("Deactivating tool:", toolName);
      tools[toolName].button.removeClass("active");
      tools[toolName].tool.finish();
    }
  };

  Toolset = _.extend(Toolset, EventsMixin);

  return Toolset;
});
