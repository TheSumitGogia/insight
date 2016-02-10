define([
    "underscore",
    "backend/test/TestCreator",
    "backend/draw/manage/ObjectIndex",
    "backend/generic/EventsMixin"
], function(_, TestCreator, ObjectIndex, EventsMixin) {
   
    Array.prototype.last = function() {
        return this[this.length - 1];
    };

    var Selection = function(items) {
        var selection = {};
        if (items === undefined) {
            selection.type = "simple";
            selection.objects = [];
            selection.copy = function() {
                var copy = {};
                copy.objects = this.objects.slice();
                copy.copy = this.copy.bind(copy);
                copy.ship = this.ship.bind(copy);
                return copy;
            };
            selection.ship = function() {
                var ship = {};
                ship.type = "simple";
                ship.objects = this.objects.map(function(obj) { return obj.identifier; });
                return ship;
            };
        } else if (Array.isArray(items)) {
            selection.type = "simple";
            selection.objects = items.map(function(item) {
                return ObjectIndex.getObjectByID(item); 
            }); 
            selection.copy = function() {
                var copy = {};
                copy.objects = this.objects.slice();
                copy.copy = this.copy.bind(copy);
                copy.ship = this.ship.bind(copy);
                return copy;
            };
            selection.ship = function() {
                var ship = {};
                ship.type = "simple";
                ship.objects = this.objects.map(function(obj) { return obj.identifier; });
                return ship;
            };
        } else {
            // items is actually an exported selection
            _.extend(selection, items); 
            selection.objects = selection.objects.map(function(item) {
                return ObjectIndex.getObjectByID(item); 
            }); 
            selection.copy = function() {
                var copy = {};
                copy.copy = this.copy.bind(copy);
                copy.ship = this.ship.bind(copy);
                return copy;
            };
            selection.ship = function() {
                var ship = {};
                ship.type = "simple";
                ship.objects = this.objects.map(function(obj) { return obj.identifier; });
                return ship;
            };
        }
        return selection; 
    };

    var PolarSelection = function(items) {
        var selection = {};
        if (items === undefined) {
            selection.type = "polar";
            selection.objects = [];
            selection.polarities = [];
            selection.copy = function() {
                var copy = {};
                copy.objects = this.objects.slice();
                copy.polarities = this.polarities.slice();
                copy.copy = this.copy.bind(copy);
                copy.ship= this.ship.bind(copy);
                return copy;
            };
            selection.ship = function() {
                var ship = {};
                ship.type = "polar";
                ship.objects = this.objects.map(function(obj) { return obj.identifier; });
                ship.polarities = this.polarities.slice();
                return ship;
            };
        } else if (Array.isArray(items)) {
            selection.type = "polar";
            selection.objects = items.map(function(item) {
                return ObjectIndex.getObjectByID(item); 
            }); 
            selection.polarities = items.map(function(item) {
                return item.polarity;
            }); 
            selection.copy = function() {
                var copy = {};
                copy.objects = this.objects.slice();
                copy.polarities = this.polarities.slice();
                copy.copy = this.copy.bind(copy);
                copy.ship= this.ship.bind(copy);
                return copy;
            };
            selection.ship = function() {
                var ship = {};
                ship.type = "polar";
                ship.objects = this.objects.map(function(obj) { return obj.identifier; });
                ship.polarities = this.polarities.slice();
                return ship;
            };
        } else {
            // items is actually an exported selection
            _.extend(selection, items);
            selection.objects = selection.objects.map(function(item) {
                return ObjectIndex.getObjectByID(item); 
            }); 
            selection.copy = function() {
                var copy = {};
                copy.objects = this.objects.slice();
                copy.polarities = this.polarities.slice();
                copy.copy = this.copy.bind(copy);
                copy.ship = this.ship.bind(copy);
                return copy;
            };
            selection.ship = function() {
                var ship = {};
                ship.type = "polar";
                ship.objects = this.objects.map(function(obj) { return obj.identifier; });
                ship.polarities = this.polarities.slice();
                return ship;
            };
        }
        return selection;
    };

    var GenSelection = function(items, examples) {
        var selection = {};
        if (items === undefined) {
            selection.type = "general";
            selection.objects = [];
            selection.examples = [];
            selection.expoles = [];
            selection.copy = function() {
                var copy = {};
                copy.objects = this.objects.slice();
                copy.examples = this.examples.slice();
                copy.expoles = this.expoles.slice();
                copy.copy = this.copy.bind(copy);
                copy.ship = this.ship.bind(copy);
                return copy;
            };
            selection.ship = function() {
                var ship = {};
                ship.type = "general";
                ship.objects = this.objects.map(function(obj) { return obj.identifier; });
                ship.examples = this.examples.map(function(obj) { return obj.identifier; });
                ship.expoles = this.expoles.slice();
                return ship;
            };
        } else if (examples !== undefined) {
            selection.type = "general";
            selection.objects = items.map(function(item) {
                return ObjectIndex.getObjectByID(item);
            });
            selection.examples = examples.map(function(ex) {
                return ObjectIndex.getObjectByID(ex.id);
            });
            selection.expoles = examples.map(function(ex) {
                return ex.polarity;
            });
            selection.copy = function() {
                var copy = {};
                copy.objects = this.objects.slice();
                copy.examples = this.examples.slice();
                copy.expoles = this.expoles.slice();
                copy.copy = this.copy.bind(copy);
                copy.ship = this.ship.bind(copy);
                return copy;
            };
            selection.ship = function() {
                var ship = {};
                ship.type = "general";
                ship.objects = this.objects.map(function(obj) { return obj.identifier; });
                ship.examples = this.examples.map(function(obj) { return obj.identifier; });
                ship.expoles = this.expoles.slice();
                return ship;
            };
        } else {
            // items is actually an exported selection
            _.extend(selection, items);
            selection.objects = selection.objects.map(function(item) {
                return ObjectIndex.getObjectByID(item);
            });
            selection.examples = selection.examples.map(function(ex) {
                return ObjectIndex.getObjectByID(ex);
            });
            selection.copy = function() {
                var copy = {};
                copy.objects = this.objects.slice();
                copy.examples = this.examples.slice();
                copy.expoles = this.expoles.slice();
                copy.copy = this.copy.bind(copy);
                copy.ship = this.ship.bind(copy);
                return copy;
            };
            selection.ship = function() {
                var ship = {};
                ship.type = "general";
                ship.objects = this.objects.map(function(obj) { return obj.identifier; });
                ship.examples = this.examples.map(function(obj) { return obj.identifier; });
                ship.expoles = this.expoles.slice();
                return ship;
            };
        }
        return selection;
    };

    var CompSelection = function(components) {
        var selection = {};
        if (components === undefined) {
            selection.components = [];
            selection.type = 'complex';
            selection.copy = function() {
                var copy = {};
                copy.type = 'complex';
                copy.components = this.components.map(function(comp) {
                    return comp.copy();
                });
                copy.copy = this.copy.bind(copy);
                copy.ship = this.ship.bind(copy);
                return copy;
            };
            selection.ship = function() {
                var ship = {};
                ship.type = "complex";
                ship.components = this.components.map(function(comp) {
                    return comp.ship();
                });
                return ship;
            };
        } else if (Array.isArray(components)) {
            selection.components = components;
            selection.copy = function() {
                var copy = {};
                copy.type = 'complex';
                copy.components = this.components.map(function(comp) {
                    return comp.copy();
                });
                copy.copy = this.copy.bind(copy);
                copy.ship = this.ship.bind(copy);
                return copy;
            };
            selection.ship = function() {
                var ship = {};
                ship.type = "complex";
                ship.components = this.components.map(function(comp) {
                    return comp.ship();
                });
                return ship;
            };
        } else {
            _.extend(selection, components);
            selection.type = 'complex';
            selection.components = selection.components.map(function(component) {
                if (component.type == "simple") {
                    return Selection(component);
                } else if (component.type == "general") {
                    return GenSelection(component);
                } else if (component.type == "polar") {
                    return PolarSelection(component);
                }
            });
            selection.copy = function() {
                var copy = {};
                copy.type = 'complex';
                copy.components = this.components.map(function(comp) {
                    return comp.copy();
                });
                copy.copy = this.copy.bind(copy);
                copy.ship = this.ship.bind(copy);
                return copy;
            };
            selection.ship = function() {
                var ship = {};
                ship.type = "complex";
                ship.components = this.components.map(function(comp) {
                    return comp.ship();
                });
                return ship;
            };
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
                    return CompSelection(tasks.target);
                });
                this.selections.push.apply(selections);
                this.dispatch("drawSelections", selections, "task");
            }); 

            this.addListener("switchTest", function(newTest, prevIndices, newIndices) {
                this.reset();
                var tasks = newTest.tasks;
                var selections = tasks.map(function(task) {
                    return CompSelection(tasks.target);
                });
                this.selections.push.apply(selections);
                this.dispatch("drawSelections", selections, "task");
            });

            this.addListener("switchTask", function(newTask, prevIndices, newIndices) {
                this.reset();
                var target = CompSelection(newTask.target);
                var stepsObjects = newTask.stepsList.map(function(steps) {
                    return PolarSelection(steps.objects); 
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
                this.selections.push(CompSelection());
                this.selections.last().components.push(GenSelection());
                this.state = [this.selections.last().copy()];
                this.currentState = 0;
                addTaskIndex = newIndices.taskIndex;
            });

            this.addListener("addSteps", function(newSteps, prevIndices, newIndices) {
                // NOTE: need to already be on a task
                this.dispatch("clearSelections", this.selections);
                this.dispatch("drawSelection", this.selections[0], "task", newIndices.taskIndex);
                this.selections.push(PolarSelection());
                this.state = [this.selections.last().copy()];
                this.currentState = 0;
                addStepsIndex = newIndices.stepsIndex;
            });

            this.addListener("contextSwitch", function(type) {
                if (type == "test") {
                    this.state = null;
                    this.currentState = null;
                    var lastSelection = this.selections.last();
                    if (TestCreator.adding == "Task") {
                        // TODO: update TestCreator.finishTask
                        TestCreator.finishTask(lastSelection.ship());
                    } else {
                        TestCreator.finishSteps(lastSelection.ship());
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
            console.log('state', this.state);
            this.dispatch("clearSelection", this.selections.last()); 
            if (this.currentState <= 0) { return; }
            console.log('curr state', this.currentState);
            this.currentState = this.currentState - 1;
            console.log('pre-undo selection', this.selections.last().copy());
            this.selections.pop();
            this.selections.push(this.state[this.currentState]);
            console.log('post-undo selection', this.selections.last().copy());
            var currSelection = this.selections.last();
            if (currSelection.type == "polar") {
                this.dispatch("drawSelection", currSelection, "steps", addStepsIndex);
            } else if (currSelection.type == "complex") {
                this.dispatch("drawSelection", currSelection, "task", addTaskIndex);
            }
        },

        redo: function() {
            this.dispatch("clearSelection", this.selections.last());
            if (this.currentState >= this.state.length) { return; }
            this.currentState = this.currentState + 1;
            this.selections.pop();
            this.selections.push(this.state[this.currentState]);
            var currSelection = this.selections.last();
            if (currSelection.type == "polar") {
                this.dispatch("drawSelection", currSelection, "steps", addStepsIndex);
            } else if (currSelection.type == "complex") {
                this.dispatch("drawSelection", currSelection, "task", addTaskIndex);
            }
        },

        // selectionFlat is an exported copy of a selection
        add: function(selectionFlat) {
            if (selectionFlat.type == "polar") {
                this.selections.push(PolarSelection(selectionFlat));
            } else if (currSelection.type == "complex") {
                this.selections.push(CompSelection(selectionFlat));
            }
        },

        get: function(index) {
            return this.selections[index];
        },

        update: function(objects, example) {
            var currSelection = this.selections.last();
            this.dispatch("clearSelection", currSelection);
            if (currSelection.components.last().type == "general") {
                // TODO: fix complexity
                var component = currSelection.components.last();
                component.objects = objects.map(function(id) {
                    return ObjectIndex.getObjectByID(id);  
                });
                component.examples.push(ObjectIndex.getObjectByID(example.id));
                component.expoles.push(example.polarity);
            } else {
                var component = GenSelection(objects, [example.id], [example.polarity]);
                currSelection.components.push(component);
            }
            this.dispatch("drawSelection", currSelection, "task", addTaskIndex);
            this.state = this.state.slice(0, this.currentState+1);
            this.state.push(currSelection.copy());
            this.currentState += 1;
        },

        append: function(object) {
            var currSelection = this.selections.last();
            this.dispatch("clearSelection", currSelection);
            if (currSelection.type == "complex") {
                if (currSelection.components.last().type == "simple") {
                    var component = currSelection.components.last();
                    component.objects.push(ObjectIndex.getObjectByID(object));
                } else {
                    var component = Selection([object]);
                    currSelection.components.push(component);
                }
                this.dispatch("drawSelection", currSelection, "task", addTaskIndex);
            } else if (currSelection.type == "polar") {
                currSelection.objects.push(ObjectIndex.getObjectByID(object.id));
                currSelection.polarities.push(object.polarity);
                this.dispatch("drawSelection", currSelection, "steps", addStepsIndex);
            }
            this.state = this.state.slice(0, this.currentState+1);
            this.state.push(currSelection.copy());
            this.currentState += 1;
        },

        toggleExamples: function(toggle) {
            var currSelection = this.selections.last();
            if (toggle) {
                this.dispatch("drawExamples", currSelection, this.selections.length-1);
            } else {
                this.dispatch("clearExamples", currSelection);
            }
        }
    };
    _.extend(SelectIndex, EventsMixin);

    return SelectIndex;
});
