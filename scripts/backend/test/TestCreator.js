define([
    "underscore",
    "backend/test/Test",
    "backend/test/Task",
    "backend/test/Steps",
    "backend/generic/Communicator",
    "backend/generic/EventsMixin"
], function(_, Test, Task, Steps, Communicator, EventsMixin) {

    var TestCreator = {
        
        currTestIndex: -1,
        currTaskIndex: -1,
        currStepsIndex: -1,
        tests: null,

        adding: null,

        initialize: function(testsData) {
            this.currTestIndex = 0;
            this.currTaskIndex = this.currStepsIndex = -1;
            this.tests = testsData.map(function(testData) {
                return Test(testData);
            });
            this.dispatch("initialize", this.tests);
        },

        search: function(tagString) {
            var testDatas = Communicator.get("test", "search_new", {"tagstring": tagString});
            this.initialize(testDatas);
        },

        _getIndices: function() {
            return {
                testIndex: this.currTestIndex,
                taskIndex: this.currTaskIndex,
                stepsIndex: this.currStepsIndex
            };
        },

        getTest: function(testIndex) {
            return this.tests[testIndex];
        },

        getTask: function(taskIndex) {
            var currentTest = this.tests[this.currTestIndex];
            return currentTest.tasks[taskIndex];
        },

        getSteps: function(stepsIndex) {
            var currentTest = this.tests[this.currTestIndex];
            var currentTask = currentTest.tasks[this.currTaskIndex];
            return currentTask.stepsList[stepsIndex];
        },

        switchTest: function(testIndex) {
            var prevIndices = this._getIndices();
            this.currTestIndex = testIndex;
            this.currTaskIndex = this.currStepsIndex = -1;
            var newIndices = this._getIndices();
            var newTest = this.tests[testIndex];
            this.dispatch("switchTest", newTest, prevIndices, newIndices);
        },

        switchTask: function(taskIndex) {
            var prevIndices = this._getIndices();
            this.currTaskIndex = taskIndex;
            this.currStepsIndex = -1;
            var newIndices = this._getIndices();
            var newTask = this.tests[this.currTestIndex][taskIndex];
            this.dispatch("switchTask", newTask, prevIndices, newIndices);
        },

        switchSteps: function(stepsIndex) {
            var prevIndices = this._getIndices();
            this.currStepsIndex = stepsIndex;
            var newIndices = this._getIndices();
            var newSteps = this.tests[this.currTestIndex][this.currTaskIndex][stepsIndex];
            this.dispatch("switchSteps", newSteps, prevIndices, newIndices);
        },

        createTask: function() {
            var prevIndices = this._getIndices();
            var currentTest = this.tests[this.currTestIndex];
            var newTask = Task({});
            currentTest.tasks.push(newTask);
            this.currTaskIndex += 1;
            this.currStepsIndex = -1;
            var newIndices = this._getIndices();
            this.dispatch("addTask", newTask, prevIndices, newIndices); 
            this.adding = "Task";
        },


        createSteps: function() {
            var prevIndices = this._getIndices();
            var currentTest = this.tests[this.currTestIndex];
            var currentTask = currentTest.tasks[this.currTaskIndex];
            var newSteps = Steps({});
            currentTask.stepsList.push(newSteps);
            this.currStepsIndex += 1;
            var newIndices = this._getIndices();
            this.dispatch("addSteps", newSteps, prevIndices, newIndices);
            this.adding = "Steps";
        },

        finishTask: function(target) {
            var currentTest = this.tests[this.currTestIndex];
            var currentTask = currentTest.tasks[this.currTaskIndex];
            // NOTE: should be latest, unfinished task
            currentTask.target = target;
            this.adding = null; 
        },

        finishSteps: function(steps) {
            var currentTest = this.tests[this.currTestIndex];
            var currentTask = currentTest.tasks[this.currTaskIndex];
            var currentSteps = currentTask.stepsList[this.currStepsIndex];
            // NOTE: should be latest, unfinished steps
            currentSteps.objects = steps; 
            this.adding = null; 
        }

    };
    _.extend(TestCreator, EventsMixin);

    return TestCreator;
});
