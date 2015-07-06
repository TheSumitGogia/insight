module.exports = function(grunt) {
  "use strict";

  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: true
      },
      all: [
        "bower.json",
        "package.json",
        "*.js",
        "scripts/**/*.js"
      ]
    },
    jscs: {
      src: "<%= jshint.all %>",
      options: {
        config: ".jscsrc"
      }
    },

    clean: ["./build"],
    copy: {
      html: { src: "insight.html", dest: "build/insight.html" },
      images: { expand: true, cwd: "images", src: "**", dest: "build/images/" },
      fonts: { expand: true, cwd: "fonts", src: "**", dest: "build/fonts/" },
      styles: { expand: true, cwd: "styles", src: "**", dest: "build/styles/" }
    },
    
    requirejs: {
      compile: {
        options: {
          paths: { "requirejs": "../bower_components/requirejs/require" },
          include: ["requirejs", "main"],
          insertRequire: ["uiloader"],
          mainConfigFile: "scripts/config.js",
          baseUrl: "scripts/",
          name: "uiloader",
          out: "build/insight.js",
          optimize: "none",
          wrapShim: true,
          useStrict: true
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-jscs");

  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-requirejs");

  grunt.registerTask("lint", ["jshint", "jscs"]);

  grunt.registerTask("build", ["lint", "clean", "copy", "requirejs"]);
  grunt.registerTask("default", ["build"]);

};
