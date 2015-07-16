define([
  "paper",
  "underscore",
  "state_management/EventsMixin"
], function(paper, _, EventsMixin) {
  
  var GroupExtension = {
    ungroup: function() {
      this.parent.addChildren(this.removeChildren());
      this.remove();
    }
  };

  var GroupOverrides = function(group) {
    var originalTranslate = group.translate;
    group.translate = function() {
      originalTranslate.apply(this, arguments);
      this.dispatch(this, "translate", arguments);
    };

    var originalScale = group.scale;
    group.scale = function() {
      originalScale.apply(this, arguments);
      this.dispatch(this, "scale", arguments);
    };

    var originalRotate = group.rotate;
    group.rotate = function() {
      originalRotate.apply(this, arguments);
      this.dispatch(this, "rotate", arguments);
    };

    var originalRemove = group.remove;
    group.remove = function() {
      originalRemove.apply(this, arguments);
      this.removeListeners();
    };
  };

  var Group = function() {
    var group = Object.create(paper.Group.prototype);
    paper.Group.apply(group, arguments);

    GroupOverrides(group);
    _.extend(group, EventsMixin, GroupExtension);
    return group;
  };

  return Group;
});
