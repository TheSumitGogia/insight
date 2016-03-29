define([
  "frontend/Graphics",
  "frontend/Navigator",
  "frontend/Modeset",
  "frontend/Toolset",
  "backend/draw/manage/ObjectIndex",
  "backend/draw/manage/SelectIndex",
  "utils/utils",
  "semantic"
], function(
  Graphics,
  Navigator,
  Toolset,
  Modeset,
  ObjectIndex,
  SelectIndex
) {
  var main = function() {
    // start front end
    Graphics.start();
    Navigator.start();

    // start back end
    ObjectIndex.create();
    SelectIndex.create();
    
    Modeset.start();
    Toolset.start();
  };

  return main;
});
