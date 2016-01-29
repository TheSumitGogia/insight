define([
  "paper",
  "underscore",
  "backend/generic/EventsMixin"
], function(paper, _, EventsMixin) {
  
    var GroupExtension = {

    };

    var GroupPrototype = _.extend({}, paper.Group.prototype, EventsMixin, GroupExtension);

    var Group = function(paperGroup) {
        _.extend(paperGroup, EventsMixin, GroupExtension);
        paperGroup.prototype = GroupPrototype;
        return paperGroup;
    };

    return Group;
});
