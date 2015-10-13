// note that extensions and StringUtils must be loaded before 
// all the app backend models for function overloading to work properly
define([
  "jquery",
  "underscore",
  "paper",
  "frontend/templating/Templater",
  "frontend/interaction/testing/TestBehaviors",
  "semantic"
], function(
  $,
  _,
  paper,
  Templater,
  TestBehaviors
) {
  return function() {
    Templater.initialize(); // initialize UI
    TestBehaviors.initialize(); // behaviors

    var drawCanvas = document.getElementById("draw-canvas");
    paper.setup(drawCanvas);
  };
});
