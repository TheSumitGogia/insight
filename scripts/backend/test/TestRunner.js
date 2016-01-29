define([
    "underscore",
    "backend/testing/TestResult",
    "backend/testing/TaskResult",
    "backend/data_structs/manage/EventsMixin"
], function(_, TestResult, TaskResult, EventsMixin) {

    var TestRunner = {
        
        tests: null,
        currentTest: null,
        currentTestIndex: null,
        currentTask: null,
        currentTaskIndex: null,
        
        testResults: null,
        taskResults: null,
        currentTestResult: null,
        currentTaskResult: null, 
        // no need to keep track of indices, redundant
        
        running: false,

        getTest: function(testIndex) {
            if (typeof testIndex === "undefined") {
                testIndex = this.currentTestIndex;
            }
            if (testIndex === null) { return -1; } // TODO: better error
            return this.tests[testIndex];
        },

        getTask: function(taskIndex) {
            if (typeof taskIndex === "undefined") {
                taskIndex = this.currentTaskIndex;
            }
            if (taskIndex === null) { return -1; } // TODO: better error
            return this.currentTest.tasks[taskIndex]; // TODO: should be getTasks
        },

        getSteps: function(taskIndex) {
            if (typeof taskIndex === "undefined") {
                taskIndex = this.currentTaskIndex;
            }
            if (taskIndex === null) { return -1; }
            return this.currentTest.tasks[taskIndex].steps;
        },

        getTestIndex: function() {
            return this.currentTestIndex;
        },

        getTaskIndex: function() {
            return this.currentTaskIndex; 
        },

        getNumTasks: function() {
            if (!this.currentTest) { return -1; } // TODO: better error
            return this.currentTest.tasks.length;
        },

        getTests: function() {
            if (!this.tests) { return -1; } // TODO: better error
            return this.tests;
        },

        setTests: function(tests) {
            if (this.running) { return -1; } // TODO: better error
            this.tests = tests;
        },

        startTests: function(tests) {
            this.currentTestIndex = 0;
            this.currentTaskIndex = 0;
            this.currentTest = this.tests[this.currentTestIndex];
            this.currentTask = this.currentTest.tasks[this.currentTaskIndex]; // TODO: should use getTasks  
            this.testResults = [];
            this.taskResults = [];

            this.running = true;
        },

        skipTest: function() {
            if (this.taskResults.length > 0) {
                this.testResults.push(TestResult(this.currentTest, this.taskResults));
                this.taskResults = [];
            }
            this.currentTaskIndex = 0;
            this.currentTestIndex += 1;
            if (this.currentTestIndex >= this.tests.length) {
                this.currentTestIndex = null;
                this.currentTaskIndex = null;
                this.currentTest = null;
                this.currentTask = null;
            } else {
                this.currentTest = this.tests[this.currentTestIndex];
                this.currentTask = this.currentTest.tasks[this.currentTaskIndex]; // TODO: should use getTasks
            }
        },

        skipTask: function() {
            this.currentTaskIndex += 1;
            if (this.currentTaskIndex >= this.currentTest.tasks.length) { // TODO: should use getTasks
                this.currentTaskIndex = null;
                this.currentTask = null;
            } else {
                this.currentTask = this.currentTest.tasks[this.currentTaskIndex]; // TODO: should use getTasks
            }
        },

        completeTest: function() {
            this.testResults.push(TestResult(this.currentTest, this.taskResults));
            this.taskResults = [];
            this.currentTaskIndex = 0;
            this.currentTestIndex += 1;
            if (this.currentTestIndex >= this.tests.length) {
                this.currentTestIndex = null;
                this.currentTaskIndex = null;
                this.currentTest = null;
                this.currentTask = null;
            } else {
                this.currentTest = this.tests[this.currentTestIndex];
                this.currentTask = this.currentTest.tasks[this.currentTaskIndex]; // TODO: should use getTasks
            }
        },

        completeTask: function(objects) {
            this.taskResults.push(TaskResult(this.currentTask, objects));
            this.currentTaskIndex += 1;
            if (this.currentTaskIndex >= this.currentTest.tasks.length) { // TODO: should use getTasks
                this.currentTaskIndex = null;
                this.currentTask = null;
            } else {
                this.currentTask = this.currentTest.tasks[this.currentTaskIndex]; // TODO: should use getTasks
            }
        },

        completeSteps: function(objects) {
            this.taskResults.push(TaskResult(this.currentTask, objects, true));
        },

        exportResults: function(args) {
            return this.testResults;
        }
    };

    TestRunner = _.extend(TestRunner, EventsMixin);
    return TestRunner;
});
