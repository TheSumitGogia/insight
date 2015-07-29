define([
  "handlebars",
  "jquery",
  "config/Defaults",
  "state_management/SelectionManager",
  "iris-color-picker"
], function(Handlebars, $, Defaults, SelectionManager) {

  var Styler = {
    _rendered: false,
    visible: false,
    sliderParams: {
      strokeWidth: {min: 0, max: 40, default: 1},
      opacity: {min: 0, max: 1, default: 1}
    },
    colorParams: ["fill", "stroke"],
    _currentFocus: "fill",
    _tool: null,

    load: function(tool) {
      if (!this._rendered) {
        this.render();
        this._rendered = true;
      }
      //   show
      // else 
      //   this.render();
      this.show();
      this._tool = tool;
      this.addListeners();
    },

    render: function() {
      // render header
      // render fill color, stroke color, none boxes
      // start iris
      // render param sliders
      //   stroke width
      //   opacity
      //
      // 
      // var source, template;
      // source = document.getElementById("styleMenuTemplate").innerHTML;
      // template = Handlebars.default.compile(source);
      // var styleMenuHTML = template({});
      // $("#style-menu").innerHTML = styleMenuHTML;
      var that = this;
      $("#color-window").iris({
        hide: false,
        color: "0093b8",
        mode: "hsl",
        controls: {
          horiz: "s",
          vert: "l",
          strip: "h"
        },
        width: 225,
        border: false,
        target: false,
        palettes: Defaults.lightPalette, 
        change: function(event, ui) {
          console.log("whatup");
          $("#" + that._currentFocus).val(ui.color.toString());
        }
      });
    },

    show: function() {
      $("#style-menu").css("display", "block");
      this.visible = true;
    },

    addListeners: function() {
      // stroke color / fill color box clic
      var that = this;
      $("#fillColorBox").click(function(event) {
      });

      $("#strokeColorBox").click(function(event) {
      });
      // stroke color / fill color box change
      $("#fill").click(function(event) {
        that._currentFocus = "fill";     
      });

      $("#stroke").click(function(event) {
        that._currentFocus = "stroke";
      });
      // stroke width slider move
      $("#width-slider").change(function(event) {
        var selection = SelectionManager.getCurrentSelection();
        var newWidth = this.val();
        if (selection) {
          for (var i = 0; i < selection.length; i++) {
            selection[i].style = {strokeWidth: newWidth}; 
          }
        } else {
          that._tool.setParam("strokeWidth", newWidth);
        }  
      });
      // opacity slider move
      $("#opacity-slider").change(function(event) {
        var selection = SelectionManager.getCurrentSelection();
        var newOpacity = this.val();
        if (selection) {
          for (var i = 0; i < selection.length; i++) {
            selection[i].opacity = newOpacity;
          }
        } else {
          that._tool.setParam("opacity", newOpacity);
        }
      });
    },

    remove: function() {
      // for now just hide 
      this.hide();
    },

    hide: function() {
      $("#style-menu").css("display", "none");
      this.visible = false;
    }
  };

  return Styler;
});
