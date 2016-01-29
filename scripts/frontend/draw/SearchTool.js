define([
    "paper",
    "underscore",
    "frontend/draw/BaseTool",
    "backend/draw/manage/ObjectIndex",
    "backend/draw/manage/SelectIndex",
    "backend/generic/EventsMixin",
    "backend/generic/Communicator"
], function(paper, _, BaseTool, ObjectIndex, SelectIndex, EventsMixin, Communicator) {
      
    var SearchTool = {};
    _.extend(SearchTool, BaseTool, {
        
        active: false,
        setup: function() {
            BaseTool.setup.call(this);

            this.activate();
            this._addObjectListeners(); 

            // TODO: move feature extraction to object index
            var objects = ObjectIndex.getObjects();
            var features = objects.reduce(function(reps, object) {
                reps[object.identifier] = object.features;
                return reps;
            }, {});
            Communicator.post("select", "full", {"features": features});
        },

        cleanup: function() {
            this._removeObjectListeners();
            Communicator.post("select", "reset", {});
            BaseTool.cleanup.call(this);
        },

        _addWorkListeners: function() {
            this.addListener("activate", function(toolName) {
                if (toolName == "search" && !this.active) {
                    this.setup();
                    this.active = true;
                }
            });
            
            this.addListener("deactivate", function(toolName) {
                if (toolName == "search" && this.active) {
                    this.cleanup();
                    this.active = false;
                }
            });
        },

        _addObjectListeners: function() {
            var allObjects = ObjectIndex.getObjects();
            for (var i = 0; i < allObjects.length; i++) {
                var object = allObjects[i];
                object.onMouseDown = this._ObjectListeners.mouseDown;
                object.onMouseUp = this._ObjectListeners.mouseUp;
                object.onClick = this._ObjectListeners.click;
                object.onMouseEnter = this._ObjectListeners.mouseEnter;
                object.onMouseLeave = this._ObjectListeners.mouseLeave;
            }
        },

        _removeObjectListeners: function() {
            var allObjects = ObjectIndex.getObjects();
            for (var i = 0; i < allObjects.length; i++) {
                var object = allObjects[i];
                object.onMouseDown = null; 
                object.onMouseUp = null; 
                object.onClick = null; 
                object.onMouseEnter = null; 
                object.onMouseLeave = null; 
            }
        },

        _setupManagement: function() {
            this._ObjectListeners.handler = this;
        },

        _ObjectListeners: {
           
            mouseDown: function(event) {
                
            },

            mouseUp: function(event) {

            },

            click: function(event) {
                var item = event.target;
                var polarity = event.modifiers.shift ? -1 : 1;
                 
                var labels = Communicator.post("select", "update", {
                    id: item.identifier,
                    polarity: polarity
                });
                var selected = Object.keys(labels).filter( function(id) {
                    var accept = labels[id] > 0 ? true : false;
                    return accept;
                }); 
                SelectIndex.update(selected);
            },

            mouseEnter: function(event) {

            },

            mouseLeave: function(event) {

            }
        }
    }, EventsMixin);

    var SearchToolBuilder = {
        initialize: function() {
            this.addListener("setupTools", function() {
                var selector = new paper.Tool();
                _.extend(selector, SearchTool);
                selector._addWorkListeners();
            });
        }
    };
    _.extend(SearchToolBuilder, EventsMixin);
    SearchToolBuilder.initialize();

    return SearchTool;
});
