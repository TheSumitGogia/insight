define([
  "handlebars"
], function(Handlebars) {
  return function() {
    console.log("Compiling Templates on Load...");

    var source, template;
    
    var presetForm = document.getElementById("presetForm"); 
    var parameters = [
      {
        parameter: "Properties", 
        shorthand: "property",
        values: [
          "Shape",
          "Fill",
          "Stroke",
          "Width",
          "Scale",
          "Rotation"
        ]
      }, 
      {
        parameter: "Test Sizes",
        shorthand: "testSize",
        values: [
          "Small",
          "Medium",
          "Large"
        ]
      },
      {
        parameter: "Ratios",
        shorthand: "ratio",
        values: [
          "Sparse",
          "Dense",
          "Full"
        ]
      },
      {
        parameter: "Clusters",
        shorthand: "cluster",
        values: [
          "1",
          "2", 
          "3", 
          "4",
          "5"
        ]
      },
      {
        parameter: "Variances",
        shorthand: "variance",
        values: [
          "None",
          "Small",
          "Large"   
        ]
      }
    ];
    source = document.getElementById("presetParamsTemplate").innerHTML;
    template = Handlebars.default.compile(source);
    var presetFormHTML = template({"parameters": parameters});
    presetForm.innerHTML = presetFormHTML;

    var toolbar = document.getElementById("toolbar");
    var toolNames = [
      "select", 
      "dirSelect", 
      "colorSelect", 
      "line", 
      "rectangle", 
      "ellipse", 
      "star", 
      "polygon", 
      "pen", 
      "represent", 
      "search"
    ];
    source = document.getElementById("toolbarTemplate").innerHTML;
    template = Handlebars.default.compile(source);
    var toolbarHTML = template({tools: toolNames});
    toolbar.innerHTML = toolbarHTML;


    // TODO: might want to move this later since it's not really templating
    var polygonToolButton = document.getElementById("polygonTool");
    polygonToolButton.className = polygonToolButton.className + " active";
  
    
    // IO Toolbar
    var iobar = document.getElementById("iobar");
    var ioToolNames = [
      "import",
      "export"
    ];
    source = document.getElementById("iobarTemplate").innerHTML;
    template = Handlebars.default.compile(source);
    var iobarHTML = template({iotools: ioToolNames});
    iobar.innerHTML = iobarHTML;
    
  };
});
