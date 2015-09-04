require.config({
  baseUrl: "scripts",
  paths: {
    "text": "../bower_components/requirejs-text/text",
    "jquery": "../bower_components/jquery/dist/jquery",
    "jquery-ui": "../bower_components/jqueryui/jquery-ui",
    "handlebars": "../bower_components/handlebars/handlebars.amd",
    "paper": "../bower_components/paper/dist/paper-full",
    "underscore": "../bower_components/underscore/underscore",
    "FileSaver": "../bower_components/file-saver.js/FileSaver",
    "jquery-mousewheel": "../bower_components/jquery-mousewheel/jquery.mousewheel",
    "iris-color-picker": "../bower_components/iris-color-picker/dist/iris",
    "semantic": "../bower_components/semantic-ui/dist/semantic.min",
    "html": "../html"
  },
  shim: {
    "iris-color-picker": {
      deps: ["jquery", "jquery-ui"]
    }
  }
});

