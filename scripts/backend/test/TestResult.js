define([
    "jquery",
    "underscore"
], function($, _) {

    var TestResultPrototype = {
        image: null,
        index: null,
        taskResults: null
    };

    var TestResult = function(test, taskResults) {
        var testResult = _.extend({}, TestResultPrototype);
        testResult.image = test.image;
        testResult.index = test.index;
        testResult.taskResults = taskResults.slice();
        return testResult; 
    };

    return TestResult;
});
