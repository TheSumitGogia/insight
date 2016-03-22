define([
  "frontend/Graphics",
  "frontend/Navigator",
  "frontend/Toolset",
  "backend/draw/manage/ObjectIndex",
  "backend/draw/manage/SelectIndex",
  "utils/utils",
  "semantic"
], function(
  Navigator,
  Toolset,
  Graphics,
  ObjectIndex,
  SelectIndex
) {
  var main = function() {
    // start front end
    Graphics.start();
    Navigator.start();
    Toolset.start();

    // start back end
    ObjectIndex.create();
    SelectIndex.create();
  };

  return main;
});
