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
      "arc", 
      "rectangle", 
      "ellipse", 
      "star", 
      "polygon", 
      "pen", 
      "repreesent", 
      "group"
    ];
    source = document.getElementById("toolbarTemplate").innerHTML;
    template = Handlebars.default.compile(source);
    var toolbarHTML = template({tools: toolNames});
    toolbar.innerHTML = toolbarHTML;
  };
});
