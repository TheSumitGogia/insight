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
      test: { src: "html/test.html", dest: "build/test.html" },
      html: { src: "html/insight.html", dest: "build/insight.html" },
      images: { expand: true, cwd: "images", src: "**", dest: "build/images/" },
      fonts: { expand: true, cwd: "fonts", src: "**", dest: "build/fonts/" },
      styles: { expand: true, cwd: "styles", src: "**", dest: "build/styles/" },
      semantic: { expand: true, cwd: "bower_components/semantic-ui/dist", src: ["*.*", "**/*.*"], dest: "build/styles/semantic" }
    },
    
    requirejs: {
      build: {
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

  grunt.registerTask("lint", ["jshint"]);

  grunt.registerTask("build", [
    "lint", 
    "clean", 
    "copy:html", 
    "copy:images", 
    "copy:fonts", 
    "copy:styles", 
    "copy:semantic", 
    "requirejs:build"
  ]);
  grunt.registerTask("default", ["build"]);

};
