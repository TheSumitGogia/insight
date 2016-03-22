define([
  "frontend/Graphics",
  "frontend/Navigator",
  "frontend/Toolset",
  "backend/ObjectIndex",
  "backend/SelectIndex",
  "utils/utils",
  "semantic"
], function(
  Navigator,
  Toolset,
  Graphics,
  ObjectIndex,
  SelectIndex,
) {
  var main = function() {
    // start front end
    Graphics.start();
    Searchbar.start();
    Toolset.start();

    // start back end
    ObjectIndex.create();
    SelectIndex.create();
  };

  return main;
});
