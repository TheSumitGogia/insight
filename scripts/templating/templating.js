define([
  "handlebars"
], function(Handlebars) {
  return function() {
    console.log("Compiling Templates on Load...");

    var source, template;

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
