define([
  "handlebars"
], function(Handlebars) {
  return function() {
    console.log("Creating Templating Helpers...");
    // helper for concatenating strings
    Handlebars.default.registerHelper("concat", function(items) {
      return items.reduce(function(prev, curr, ind, arr) {
        return (prev + curr);
      });
    });
  };  
});
