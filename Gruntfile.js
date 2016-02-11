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

    clean: {
      build: ["./build"],
      export: {
        options: { force: true },
        src: ["../export"]
      }
    },

    copy: {
      html: { src: "dom/insight.html", dest: "build/insight.html" },
      images: { expand: true, cwd: "images", src: "**", dest: "build/images/" },
      styles: { expand: true, cwd: "styles", src: "**", dest: "build/styles/" },
      semantic: { expand: true, cwd: "bower_components/semantic-ui/dist", src: ["*.*", "**/*.*"], dest: "build/styles/semantic" },
      expBuild: { expand: true, cwd: "build", src: "**", dest: "../export/build" },
      expTest: { expand: true, cwd: "../test", src: "**", dest: "../export/test" },
      expScripts: { expand: true, flatten: true, src: "scripts/**/*.py", dest: "../export/scripts" }
    },
    
    compress: {
      export: {
        options: {
          archive: "../export.tar.gz",
          mode: "tgz"
        },
        expand: true,
        cwd: "../export/",
        src: ["**"],
        dest: "export" 
      }
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

  grunt.loadNpmTasks("grunt-contrib-compress");

  grunt.registerTask("lint", ["jshint"]);

  grunt.registerTask("build", [
    "clean:build", 
    "copy:html", 
    "copy:images", 
    "copy:styles", 
    "copy:semantic", 
    "requirejs:build"
  ]);
  grunt.registerTask("export", [
    "clean:export",
    "copy:expBuild",
    "copy:expTest",
    "copy:expScripts",
    "compress:export"
  ]);
  grunt.registerTask("default", ["build"]);

};
