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
    search: { button: $("#searchButton"), tool: SearchTool },
    select: { button: $("#selectButton"), tool: SelectTool }
  };

  // initialize each of the paper tools
  var createTools = function() {
    _.each(tools, function(tool, toolName) {
      tools[toolName].tool = tool.tool.create();
    });
  };

  // get tool name from button id
  var trimID = function(buttonID) {
    return buttonID.substring(0, buttonID.length - 6);
  };

  var Toolset = {

    current: null,
    start: function() {
      var bar = this;
      bar.current = defaultTool; 

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
      this.addListener("load", function() {
        bar.reset(); 
      });

      this.addListener("reset", function() {
        bar.reset();
      });
    },

    reset: function() {
      var bar = this;
      _.each(tools, function(tool, toolName) {
        bar.deactivate(toolName);
        bar.activate(defaultTool);
      });
      bar.current = defaultTool;
    },

    activate: function(toolName) {
      tools[toolName].button.addClass("active");
      tools[toolName].tool.start();
    },

    deactivate: function(toolName) {
      tools[toolName].button.removeClass("active");
      tools[toolName].tool.finish();
    }
  };

  Toolset = _.extend(Toolset, EventsMixin);

  return Toolset;
});
