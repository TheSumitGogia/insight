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
  "tools/SearchTool",
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
  SearchTool, 
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
      "search": SearchTool
    },

    setupTools: function() {
      for (var tool in this.tools) {
        if (this.tools.hasOwnProperty(tool)) {
          // initialize paper tool due to required constructor
          // then extend with insight tool functionality 
          var toolType = this.tools[tool];
          this.tools[tool] = new paper.Tool();
          _.extend(this.tools[tool], toolType);
          this.tools[tool].setManager(this);
        }
      }

      // TODO: ideally should be synchronized with button activation
      this.tools["polygon"].activate();
      var canvas = $("#draw-canvas");
      canvas.mousewheel(this.tools["polygon"].onMouseWheel.bind(this.tools["polygon"]));
    },

    _manager: null,
    _currentTool: "polygon",

    getCurrentTool: function() {
      return this._currentTool;
    },

    switchTool: function(tool) {
      this.tools[this._currentTool].cleanup();
      this._currentTool = tool;
      this.tools[tool].activate();
      this.tools[tool].setup();
      console.log(tool + " activated!");
    
      // seems a little odd, but really should be here since paper
      // tools don't have a mousewheel event and a manager should
      // be in charge of adding and removing event handlers
      var canvas = $("#draw-canvas");
      var targetTool = this.tools[this._currentTool];
      canvas.mousewheel(targetTool.onMouseWheel.bind(targetTool));
    },
    
    setManager: function(manager) {
      this._manager = manager;
    },

    request: function(managerName, method, args) {
      return this._manager.handleRequest(managerName, method, args);
    }
  };

  return ToolManager;
});
