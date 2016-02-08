define([
    "underscore",
    "backend/test/TestCreator",
    "backend/draw/manage/ObjectIndex",
    "backend/generic/EventsMixin"
], function(_, TestCreator, ObjectIndex, EventsMixin) {
   
    Array.prototype.last = function() {
        return this[this.length - 1];
    };

    var Selection = function(items, polarized) {
        var selection = {};
        selection.objects = items.map(function(item) {
            return ObjectIndex.getObjectByID(item); 
        }); 
        if (polarized) { 
            selection.polarities = items.map(function(item) {
                return item.polarity;
            }); 
        }
        selection.copy = function() {
            var copy = {};
            copy.objects = this.objects.slice();
            if (this.polarities) {
                copy.polarities = this.polarities.slice();
            }
            return copy;
        }
        return selection; 
    };

    var addTaskIndex = null;
    var addStepsIndex = null;

    var SelectIndex = {
        state: null,
        currentState: null,
        selections: null,

        setup: function() {
            this.selections = [];
            this.addListener("initialize", function(tests) {
                this.reset();
                var tasks = tests[0].tasks;
                var selections = tasks.map(function(task) {
                    return Selection(tasks.target, false);
                });
                this.selections.push.apply(selections);
                this.dispatch("drawSelections", selections, "task");
            }); 

            this.addListener("switchTest", function(newTest, prevIndices, newIndices) {
                this.reset();
                var tasks = newTest.tasks;
                var selections = tasks.map(function(task) {
                    return Selection(tasks.target, false);
                });
                this.selections.push.apply(selections);
                this.dispatch("drawSelections", selections, "task");
            });

            this.addListener("switchTask", function(newTask, prevIndices, newIndices) {
                this.reset();
                var target = Selection(newTask.target, false);
                var stepsObjects = newTask.stepsList.map(function(steps) {
                    return Selection(steps.objects, true); 
                });
                this.selections.push(target);
                this.dispatch("clearSelections", this.selections);
                this.dispatch("drawSelection", target, "task", newIndices.taskIndex);
                this.selections.push.apply(stepsObjects);
                this.dispatch("drawSelections", stepsObjects, "steps");
            });

            this.addListener("switchSteps", function(newSteps, prevIndices, newIndices) {
                var selection = this.selections[newIndices.stepIndex + 1];
                this.dispatch("clearSelections", this.selections);
                this.dispatch("drawSelection", this.selections[0], "task", newIndices.taskIndex);
                this.dispatch("drawSelection", selection, "steps", newIndices.stepsIndex);
            });

            this.addListener("addTask", function(newTask, prevIndices, newIndices) {
                this.dispatch("clearSelections", this.selections);
                this.reset();
                this.selections.push(Selection([], false));
                this.state = [this.selections.last().copy()];
                this.currentState = 0;
                addTaskIndex = newIndices.taskIndex;
            });

            this.addListener("addSteps", function(newSteps, prevIndices, newIndices) {
                // NOTE: need to already be on a task
                this.dispatch("clearSelections", this.selections);
                this.dispatch("drawSelection", this.selections[0], "task", newIndices.taskIndex);
                this.selections.push(Selection([], true));
                this.state = [this.selections.last().copy()];
                this.currentState = 0;
                addStepsIndex = newIndices.stepsIndex;
            });

            this.addListener("contextSwitch", function(type) {
                if (type == "test") {
                    this.state = null;
                    this.currentState = null;
                    if (TestCreator.adding == "Task") {
                        TestCreator.finishTask(this.selections.last().objects);
                    } else {
                        TestCreator.finishSteps(this.selections.last().objects, this.selections.last().polarities);
                    }
                }
            });
        },

        reset: function(options) {
            this.selections = [];
            this.state = null;
            this.currentState = null;
            addTaskIndex = null;
            addStepsIndex = null;
        },

        undo: function() {
            this.dispatch("clearSelection", this.selections.last()); 
            this.currentState = this.currentState - 1;
            this.selections.pop();
            this.selections.push(this.state[this.currentState]);
            var currSelection = this.selections.last();
            if (currSelection.polarities) {
                this.dispatch("drawSelection", currSelection, "steps", addStepsIndex);
            } else {
                this.dispatch("drawSelection", currSelection, "task", addTaskIndex);
            }
        },

        redo: function() {
            this.dispatch("clearSelection", this.selections.last());
            this.currentState = this.currentState + 1;
            this.selections.pop();
            this.selections.push(this.state[this.currentState]);
            var currSelection = this.selections.last();
            if (currSelection.polarities) {
                this.dispatch("drawSelection", currSelection, "steps", addStepsIndex);
            } else {
                this.dispatch("drawSelection", currSelection, "task", addTaskIndex);
            }
        },

        add: function(objects, polarized) {
            this.selections.push(Selection(objects, polarized));
        },

        get: function(index) {
            return this.selections[index];
        },

        update: function(objects) {
            this.dispatch("clearSelection", this.selections.last());
            this.selections.pop(); 
            this.selections.push(Selection(objects, false)); 
            var currSelection = this.selections.last();
            this.state.push(currSelection.copy());
            this.dispatch("drawSelection", currSelection, "task", addTaskIndex);
        },

        append: function(object) {
            this.dispatch("clearSelection", this.selections.last());
            var deepObj = ObjectIndex.getObjectByID(object.id);
            var currSelection = this.selections.last();
            if (currSelection.polarities) {
                currSelection.objects.push(deepObj);
                currSelection.polarities.push(object.polarity);
                this.state.push(currSelection.copy());
                this.dispatch("drawSelection", currSelection, "steps", addStepsIndex);
            } else {
                currSelection.objects.push(deepObj);
                this.state.push(currSelection.copy());
                this.dispatch("drawSelection", currSelection, "task", addTaskIndex);
            }
        }
    };
    _.extend(SelectIndex, EventsMixin);

    return SelectIndex;
});
