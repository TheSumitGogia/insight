define([
    "paper",
    "jquery",
    "underscore",
    "backend/generic/EventsMixin"
], function(paper, $,  _, EventsMixin) {

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

    var BoxSelectVis =  {

        drawSelection: function(selection, type, index) {
            var colors = (type == "task") ? taskColors : stepsColors;
            for (var i = 0; i < selection.objects.length; i++) {
                selection.objects[i].bounds.selected = true;
                selection.objects[i].selectedColor = colors[index];
                if (type == "steps" && selection.polarities[i] == -1) {
                    var pColor = selection.objects[i].selectedColor;
                    var sColor = paper.Color(pColor);
                    sColor.saturation = Math.floor(pColor.saturation / 2);
                    selection.objects[i].selectedColor = sColor;
                }
            }
        }, 

        clearSelections: function(selections) {
            for (var i = 0; i < selections.length; i++) {
                var selection = selections[i];
                this.clearSelection(selection);
            } 
        },

        clearSelection: function(selection) {
            for (var i = 0; i < selection.objects.length; i++) {
                var object = selection.objects[i];
                object.bounds.selected = false;
            } 
        }
    };

    var OutlineSelectVis = {

        bwidth: 2,
        boundaries: {},

        drawSelections: function(selections, type) {
            for (var i = 0; i < selections.length; i++) {
                this.drawSelection(selections[i], type, i);
            }
        },
        
        drawSelection: function(selection, type, index) {
            var colors = (type == "task") ? taskColors: stepsColors;
            for (var i = 0; i < selection.objects.length; i++) {
                var object = selection.objects[i];
                var boundary = object.clone(true);
                boundary.fillColor = null;
                boundary.scale(object.strokeBounds.width / object.bounds.width);
                boundary.strokeColor = colors[index];
                boundary.strokeWidth = this.bwidth;
                if (type == "steps" && selection.polarities[i] == -1) {
                    var pColor = boundary.strokeColor;
                    var sColor = paper.Color(pColor);
                    sColor.saturation = Math.floor(pColor.saturation / 2);
                    boundary.strokeColor = sColor;
                } 
                this.boundaries[object.identifier] = boundary;
            }
        },

        clearSelections: function(selections) {
            for (var i = 0; i < selections.length; i++) {
                var selection = selections[i];
                this.clearSelection(selection);
            } 
            paper.view.draw();
        },

        clearSelection: function(selection) {
            for (var i = 0; i < selection.objects.length; i++) {
                var object = selection.objects[i];
                var id = object.identifier; 
                var boundary = this.boundaries[id];
                boundary.remove();
                delete this.boundaries[id];
            }
            paper.view.draw();
            console.log("boundaries", this.boundaries);
        }
    };

    var Drawer = _.extend({

        initialize: function() {
            this.addListener("fit", this.fitToWindow);
            this.addListener("clearSelection", this.clearSelection);
            this.addListener("clearSelections", this.clearSelections);
            this.addListener("drawSelection", this.drawSelection);
            this.addListener("drawSelections", this.drawSelections);
        },

        clear: function() {
            paper.project.clear();
            this.redraw();
        },

        redraw: function() {
            paper.view.draw();   
        },

        // NOTE: operates on current SVG in paper
        fitToWindow: function(allObjects) {
            var boundTypes = ["left", "right", "top", "bottom"];
            var getMinmaxBounds = function(objects) {
                var allBounds = {};
                var boundMins = {};
                var boundMaxs = {};
                for (var i = 0; i < boundTypes.length; i++) {
                    var boundType = boundTypes[i];
                    allBounds[boundType] = objects.map(function(obj) {
                        return obj.bounds[boundType];         
                    });
                    boundMins[boundType] = Math.min.apply(Math, allBounds[boundType]);
                    boundMaxs[boundType] = Math.max.apply(Math, allBounds[boundType]);
                }
                var resultBounds = {
                    'left': boundMins['left'], 
                    'right': boundMaxs['right'],
                    'top': boundMins['top'],
                    'bottom': boundMaxs['bottom']
                };
                return resultBounds;
            };


            var minmaxBounds = getMinmaxBounds(allObjects);
            var trimObjects = [];
            for (var j = 0; j < allObjects.length; j++) {
                var object = allObjects[j];
                var numExtremes = 0;
                for (var k = 0; k < boundTypes.length; k++) {
                    var boundType = boundTypes[k];
                    if (object.bounds[boundType] == minmaxBounds[boundType]) {
                        numExtremes += 1;
                    }
                } 
                if (numExtremes < 3) {
                    trimObjects.push(object); 
                } 
            }

            var newMinmaxBounds = getMinmaxBounds(trimObjects);
            var width = newMinmaxBounds['right'] - newMinmaxBounds['left'];
            var height = newMinmaxBounds['bottom'] - newMinmaxBounds['top'];
            var newRectBounds = {
                'left': newMinmaxBounds['left'] - (0.05) * width, 
                'right': newMinmaxBounds['right'] + (0.05) * width, 
                'top': newMinmaxBounds['top'] - (0.05) * height,
                'bottom': newMinmaxBounds['bottom'] + (0.05) * height
            };

            var newWidth = newRectBounds['right'] - newRectBounds['left'];
            var newHeight = newRectBounds['bottom'] - newRectBounds['top'];
            var widthRatio = newWidth / paper.view.size.width;
            var heightRatio = newHeight / paper.view.size.height;
            
            var maxRatio = Math.max.apply(Math, [widthRatio, heightRatio]);
            for (var l = 0; l < paper.project.layers.length; l++) {
                var layer = paper.project.layers[l];
                layer.translate(paper.view.bounds.left - newRectBounds.left, paper.view.bounds.top - newRectBounds.top);
                layer.scale(1.0 / maxRatio, [paper.view.bounds.left, paper.view.bounds.top]);
            }
            this.redraw();
        },

        pan: function(delta) {
            paper.view.center = paper.view.center.add(delta);
        },

        zoom: function(delta, stablePoint) {
            var zoomFactor = 1.05;
            var center = paper.view.center;
            var newZoom = paper.view.zoom;
            if (delta < 0) {
                newZoom = newZoom / zoomFactor; 
            } else if (delta > 0) {
                newZoom = newZoom * zoomFactor; 
            } 
            var beta = paper.view.zoom / newZoom; 
            var translation = stablePoint.subtract(center);
            var zoomCorrection = stablePoint.subtract(translation.multiply(beta)).subtract(center);
            paper.view.zoom = newZoom;
            paper.view.center = paper.view.center.add(zoomCorrection);
        },

        drawSelections: function(selections, type) {
            OutlineSelectVis.drawSelections(selections, type);
        },

        drawSelection: function(selection, type, index) {
            OutlineSelectVis.drawSelection(selection, type, index);
        }, 

        clearSelections: function(selections) {
            OutlineSelectVis.clearSelections(selections);
        },

        clearSelection: function(selection) {
            OutlineSelectVis.clearSelection(selection);
        }

    }, EventsMixin);
        

    return Drawer;
});
