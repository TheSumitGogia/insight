define([
    "jquery",
    "underscore"
], function($, _) {

    var StepsPrototype = {
        objects: []
    };

    var Steps = function(data) {
        var steps = _.extend({}, StepsPrototype, data);
        return steps;
    };

    return Steps;
});
