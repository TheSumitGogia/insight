define([
    "jquery",
    "underscore",
    "backend/test/TestCreator",
    "frontend/draw/Drawer",
    "backend/generic/EventsMixin",
    "templates"
], function($, _, TestCreator, Graphics, EventsMixin, templates) {

    var taskColors = [
        "#E4007C", //magenta
        "#EE2605", //wm red
        "#158442", //neon green
        "#3369E8", //search blue
        "#F4CA16"  //dawn of new day
    ];

    var stepsColors = [
        "#0074D9", //blue
        "#39CCCC", //teal
        "#3D9970", //olive
        "#01FF70", //lime
        "#FFDC00", //yellow
        "#FF851B", //orange
        "#FF4136", //red
        "#85144B", //maroon
        "#B10DC9" //purple 
    ];
    
    var ListBehaviors = _.extend({

        initialize: function() {
            $("#addTaskButton").click(this.onTaskAddClick);
            $("#addStepsButton").click(this.onStepsAddClick);
            this.addListener("testSwitch", this.onTestSwitch);
            this.addListener("taskSwitch", this.onTaskSwitch);
            this.addListener("stepsSwitch", this.onStepsSwitch);
            this.addListener("addTask", this.onTaskAdd);
            this.addListener("addSteps", this.onStepsAdd);
        },

        onTestClick: function(event) {
            var newTestIndex = DOMManipulation.indicesFromTestDiv($(event.target)).testIndex;
            TestCreator.switchTest(newTestIndex);
        },

        onTaskClick: function(event) {
            var newTaskIndex = DOMManipulation.indicesFromTaskDiv($(event.target)).taskIndex;
            TestCreator.switchTask(newTaskIndex);
        },

        onStepsClick: function(event) {
            var newStepsIndex = DOMManipulation.indicesFromStepsDiv(event.target).stepsIndex;
            TestCreator.switchSteps(newStepsIndex);
        },

        onTaskAddClick: function(event) {
            TestCreator.createTask();
        },

        onStepsAddClick: function(event) {
            TestCreator.createSteps();
        },

        onTestSwitch: function(prevIndices, newIndices) {
            var currTestIndex = prevIndices.testIndex; 
            var currTaskIndex = prevIndices.taskIndex;
            DOMManipulation.deactivateSteps();
            DOMManipulation.deactivateTask();
            DOMManipulation.closeTaskList(currTestIndex);
            DOMManipulation.closeStepsList(currTestIndex, currTaskIndex);
            DOMManipulation.deactivateTest();

            var newTestIndex = newIndices.testIndex; 
            DOMManipulation.activateTest(newTestIndex);
            DOMManipulation.openTaskList(newTestIndex);
        },

        onTaskSwitch: function(prevIndices, newIndices) {
            var currTestIndex = prevIndices.testIndex;
            var currTaskIndex = prevIndices.taskIndex;
            DOMManipulation.deactivateSteps();
            DOMManipulation.closeStepsList(currTestIndex, currTaskIndex);
            DOMManipulation.deactivateTask();

            var newTaskIndex = newIndices.taskIndex;
            DOMManipulation.activateTask(newTaskIndex);
            DOMManipulation.openStepsList(newIndices.taskIndex, newTaskIndex);
        },

        onStepsSwitch: function(prevIndices, newIndices) {
            DOMManipulation.deactivateSteps();
            var newStepsIndex = newIndices.stepsIndex; 
            DOMManipulation.activateSteps(newStepsIndex);
        },

        onTaskAdd: function(task, prevIndices, newIndices) {
            // clean up previous task work
            DOMManipulation.deactivateSteps();
            DOMManipulation.closeStepsList(prevIndices.testIndex, prevIndices.taskIndex);
            DOMManipulation.deactivateTask();

            var context = _.extend({}, task, newIndices); 
            var taskHTML = templates["task"](context);
            var taskListID = "tasklist" + newIndices.testIndex;
            $("#" + taskListID).append(taskHTML);
            DOMManipulation.openStepsList(newIndices.testIndex, newIndices.taskIndex);
            DOMManipulation.activateTask(newIndices.taskIndex); 
        },

        onStepsAdd: function(steps, prevIndices, newIndices) {
            // clean up previous steps work
            DOMManipulation.deactivateSteps();

            var context = _.extend({}, steps, newIndices); 
            var stepsHTML = templates["steps"](context);
            var stepsListID = ("stepslist" + newIndices.testIndex + "-" + newIndices.taskIndex);
            $("#" + stepsListID).append(stepsHTML);
            DOMManipulation.activateSteps(newIndices.stepsIndex);
        }
    }, EventsMixin);

    var SearchBehaviors = _.extend({

        _searchInput: null,
        _searchButton: null,
        _searchEl: null,

        initialize: function() {
            this._searchInput = $("#searchInput .prompt");
            this._searchEl = $("#searchInput"); 
            this._searchButton = $("#searchButton");

            this.autocomplete();
            this.search();
        },

        autocomplete: function() {
            var searcher = this;
            searcher._searchEl.search({
                apiSettings: {
                        url: 'http://127.0.0.1:8080/?{%22message%22:%22tags%22,%22tagstring%22:%22{query}%22}'
                },
                onSelect: this._onTagSelect.bind(searcher)
            });
        },

        search: function() {
            var searcher = this;
            searcher._searchButton.click(function(event) {
                var tagString = searcher._searchInput.val();
                TestCreator.search(tagString);
            });
            this.addListener("initialize", this._onSearchResults);
        },

        _onTagSelect: function(result, response) {
            var currentText = this._searchInput.val();
            var currTextSplit = currentText.split(";");
            var previousTagString = currTextSplit.slice(0, -1).join(";");
            if (previousTagString !== "") {
                previousTagString += ";";
            }
            this._searchEl.focus();
            this._searchEl.search("set value", (previousTagString + result.title));
            this._searchEl.search("hide results"); 
            this._searchInput.focus();
            return false;
        },

        _onSearchResults: function(tests) {
            var testTemplate = templates["testlist"];
            var testHTML = testTemplate({"tests": tests});
            $("#editHeader").after(testHTML);
            for (var i = 0; i < tests.length; i++) {
                var id = "testtext" + i;
                var testDiv = $("#" + id);
                testDiv.click(ListBehaviors.onTestClick);
            }

            DOMManipulation.activateTest(0);
            DOMManipulation.openTaskList(0);
        },
    }, EventsMixin);

    var DOMManipulation = {

        closeTaskList: function(testIndex) {
            var taskListID = "tasklist" + testIndex;
            var taskList = $("#" + taskListID);
            taskList.css("display", "none"); 
        },

        closeStepsList: function(testIndex, taskIndex) {
            var stepsListID = "stepslist" + testIndex + "-" + taskIndex;
            var stepsList = $("#" + stepsListID);
            stepsList.css("display", "none");
        },

        openTaskList: function(testIndex) {
            var taskListID = "tasklist" + testIndex;
            var taskList = $("#" + taskListID);
            taskList.css("display", "block");
        },

        openStepsList: function(testIndex, taskIndex) {
            var stepsListID = "stepslist" + testIndex + "-" + taskIndex;
            var stepsList = $("#" + stepsListID);
            stepsList.css("display", "block");
        },

        deactivateTest: function() {
            var currTest = $(".test.active");
            var currTestText = $(".test.active .testtext");
            currTest.removeClass("active");
            currTestText.css("background-color", "");
        },

        deactivateTask: function() {
            var currTask = $(".task.active");
            var currTaskText = $(".task.active .tasktext"); 
            currTask.removeClass("active");
            currTaskText.css("background-color", "");
        },

        deactivateSteps: function() {
            var currSteps = $(".steps.active");
            var currStepsText = $(".steps.active .stepstext");
            currSteps.removeClass("active");
            currStepsText.css("background-color", "");
        },

        activateTest: function(testIndex) {
            var testID = "test" + testIndex;
            var testtextID = "testtext" + testIndex;
            $("#" + testID).addClass("active");
            $("#" + testtextID).css("background-color", "#eee");
        },

        activateTask: function(taskIndex) {
            var currTestIndex = $(".test.active").attr('id')[4];
            var taskID = "task" + currTestIndex + "-" + taskIndex;
            var tasktextID = "tasktext" + currTestIndex + "-" + taskIndex;
            $("#" + taskID).addClass("active");
            $("#" + tasktextID).css("background-color", taskColors[taskIndex]);
        },

        activateSteps: function(stepsIndex) {
            var currTestIndex = $(".test.active").attr('id')[4];
            var currTaskIndex = $(".task.active").attr('id')[4];
            var stepsID = "steps" + currTestIndex + "-" + currTaskIndex + "-" + stepsIndex;
            var stepstextID = "stepstext" + currTestIndex + "-" + currTaskIndex + "-" + stepsIndex;
            $("#" + stepsID).addClass("active"); 
            $("#" + stepstextID).css("background-color", stepsColors[stepsIndex]);
        },

        indicesFromTestDiv: function(testDiv) {
            var testID = testDiv.attr('id');
            var idxID = testID.substring(8);
            var idxSplit = idxID.split('-');
            var indices = {
                testIndex: idxSplit[0] 
            };
            return indices;
        },

        indicesFromTaskDiv: function(taskDiv) {
            var taskID = taskDiv.attr('id');
            var idxID = taskID.substring(8);
            var idxSplit = idxID.split('-');
            var indices = {
                testIndex: idxSplit[0],
                taskIndex: idxSplit[1]
            };
            return indices;
        },

        indicesFromStepsDiv: function(stepsDiv) {
            var stepsID = stepsDiv.attr('id');
            var idxID = stepsID.substring(9);
            var idxSplit = idxID.split('-');
            var indices = {
                testIndex: idxSplit[0],
                taskIndex: idxSplit[1],
                stepsIndex: idxSplit[2]
            };
            return indices;
        }
    };


    var CreateInteraction = {
        initialize: function() {
            SearchBehaviors.initialize();
            ListBehaviors.initialize();
        }
    };
    
    return CreateInteraction;
});
