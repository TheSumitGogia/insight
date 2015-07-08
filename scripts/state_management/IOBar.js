define([
  "paper",
  "FileSaver"
], function(paper, FileSaver) {
  
  return function() { 
    console.log("Initializing iobar behaviors...");

    var importButton = document.getElementById("importTool");
    var exportButton = document.getElementById("exportTool");
    var importInput = document.getElementById("importInput");

    importButton.addEventListener("click", function(event) {
      importInput.click();
      this.blur();
    });

    exportButton.addEventListener("click", function(event) {
      var exportString = paper.project.exportSVG({asString: true});
      var exportBlob = new Blob([exportString], {type: "image/svg+xml;charset=utf-8"});
      var fileSaver = new FileSaver(exportBlob, "drawing.svg");
      this.blur();
    });

    importInput.addEventListener("change", function(event) {
      var file = this.files[0];
      var filename = file.name;
      if (!file.name.endsWith(".svg")) { 
        console.log("ERROR: Import file was not an SVG!");
        alert("ERROR: Import file was not an SVG!");
        return;
      } 
      paper.project.importSVG(file);
    });
  };
});
