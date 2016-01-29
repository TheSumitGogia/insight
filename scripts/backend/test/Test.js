define([
    "jquery",
    "underscore",
], function($, _) {
    
    var TestPrototype = {
        image: null, 
        tasks: []
    };

    var Test = function(data) {
        var test = _.extend({}, TestPrototype, data);
        return test;
    };

    return Test;
});
