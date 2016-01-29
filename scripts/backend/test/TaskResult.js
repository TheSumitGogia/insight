define([
    "jquery",
    "underscore"
], function($, _) {

    var TaskResultPrototype = {
        index: null,
        objects: null,
        auto: false
    };

    var TaskResult = function(task, objects, auto) {
        var taskResult = _.extend({}, TaskResultPrototype);
        taskResult.index = task.index;
        taskResult.objects = objects;
        if (auto) { taskResult.auto = true; }
        return taskResult; 
    }; 
     
    return TaskResult;
});
