define([
  "paper",
  "handlebars",
  "jquery",
  "config/Defaults",
  "state_management/SelectionManager",
  "iris-color-picker"
], function(paper, Handlebars, $, Defaults, SelectionManager) {

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
      this._tool.setParam("style.fillColor", $("#fill").val());
      this._tool.setParam("style.strokeColor", $("#stroke").val());
      this._tool.setParam("style.strokeWidth", $("#strokeWidthSlider").val());
      this._tool.setParam("opacity", $("#opacitySlider").val());
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
          $("#" + that._currentFocus).val(ui.color.toString());
          var selection = SelectionManager.getCurrentSelection();
          var newColor = ui.color.toString();
          var styleKey = that._currentFocus + "Color";
          if (selection) {
            for (var i = 0; i < selection.length; i++) {
              var style = {};
              style[styleKey] = newColor;
              selection[i].style = style;
            }
            paper.view.draw();
          } else {
            that._tool.setParam("style." + styleKey, newColor);
          }
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
      $("#strokeWidthSlider").change(function(event) {
        var selection = SelectionManager.getCurrentSelection();
        var newWidth = $("#strokeWidthSlider").val();
        if (selection) {
          for (var i = 0; i < selection.length; i++) {
            selection[i].style = {strokeWidth: newWidth};
          }
          paper.view.draw();
        } else {
          that._tool.setParam("style.strokeWidth", newWidth);
        }  
      });
      // opacity slider move
      $("#opacitySlider").change(function(event) {
        var selection = SelectionManager.getCurrentSelection();
        var newOpacity = $("#opacitySlider").val();
        if (selection) {
          for (var i = 0; i < selection.length; i++) {
            selection[i].opacity = newOpacity;
          }
          paper.view.draw();
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
