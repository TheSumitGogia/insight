define([
    "paper",
    "underscore",
    "frontend/draw/Drawer"
], function(paper, _, Drawer) {

    var BaseTool = {

        _keys: {
            panKey: 'r',
            zoomKey: 'e'   
        },

        onMouseDrag: function(event) {
            if (paper.Key.isDown(this._keys.panKey)) {
                Drawer.pan(event.delta);
            } 
        },

        onMouseWheel: function(event) {
            if (paper.Key.isDown(this._keys.zoomKey)) {
              var mousePosition = new paper.Point(event.offsetX, event.offsetY);
              var viewPosition = paper.view.viewToProject(mousePosition);
              Drawer.zoom(event.deltaY, viewPosition); 
              event.preventDefault();
            }
        },

        setup: function() {
            $(paper.view.element).on('mousewheel', this.onMouseWheel.bind(this));
        },
        
        cleanup: function() {
            $(paper.view.element).off('mousewheel');
        }
    };

    return BaseTool;
});
