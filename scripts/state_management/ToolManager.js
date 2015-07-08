define([
  "paper",
  "underscore",
  "Manager",
  "tools/SelectTool",
  "tools/DirSelectTool",
  "tools/ColorSelectTool",
  "tools/LineTool",
  "tools/ArcTool",
  "tools/RectangleTool",
  "tools/EllipseTool",
  "tools/StarTool",
  "tools/PolygonTool",
  "tools/PenTool",
  "tools/RepresentTool",
  "tools/GroupTool"
], function(
  paper, 
  _,
  Manager, 
  SelectTool, 
  DirSelectTool, 
  ColorSelectTool, 
  LineTool, 
  ArcTool, 
  RectangleTool, 
  EllipseTool, 
  StarTool, 
  PolygonTool, 
  PenTool, 
  RepresentTool, 
  GroupTool
) {

  var ToolManager = {
    tools: {
      "select": SelectTool,
      "dirSelect": DirSelectTool,
      "colorSelect": ColorSelectTool,
      "line": LineTool,
      "rectangle": RectangleTool,
      "ellipse": EllipseTool,
      "star": StarTool,
      "polygon": PolygonTool,
      "pen": PenTool,
      "represent": RepresentTool,
      "group": GroupTool
    },

    setupTools: function() {
      for (var tool in this.tools) {
        if (this.tools.hasOwnProperty(tool)) {
          // initialize paper tool due to required constructor
          // then extend with insight tool functionality 
          var toolType = this.tools[tool];
          this.tools[tool] = new paper.Tool();
          _.extend(this.tools[tool], toolType);
        }
      }

      // TODO: ideally should be synchronized with button activation
      this.tools["polygon"].activate();
    },

    _manager: null,
    _currentTool: "polygon",

    setManager: function(manager) {
      this._manager = manager;
    },

    getCurrentTool: function() {
      return this._currentTool;
    },

    switchTool: function(tool) {
      this._currentTool = tool;
      this.tools[tool].activate();
      console.log(tool + " activated!");
    }
  };

  return ToolManager;
});
