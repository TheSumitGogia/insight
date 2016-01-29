define([
    "jquery",
    "underscore"
], function($, _) {

    var TaskPrototype = {
        target: null,
        stepsList: [],
    };
   
    var Task = function(data) {
        var task = _.extend({}, TaskPrototype, data);
        return task;
    };

    return Task;
});  
