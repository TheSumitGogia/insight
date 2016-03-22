define([
  "paper",
  "backend/draw/objects/Path",
  "backend/draw/objects/Group"
], function(paper, Path, Group) {

  var Geometry = {
    Path: Path,
    Group: Group,

    convert: function(item) {
      if (item instanceof paper.Path) {
        return Path(item);
      } else if (item instanceof paper.Group) {
        return Group(item);
      }
    }
  };

  return Geometry;
});
