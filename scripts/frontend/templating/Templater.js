define([
  "handlebars"
], function(Handlebars) {
    
    var Templater = {

        initialize: function() {
            console.log("Compiling Initial Templates...");

            // Toolbar
            // this.templateToolbar(); 
        },

        templateToolbar: function() {
            
            var toolbar = document.getElementById("toolbar");
            var source = document.getElementById("toolbarTemplate").innerHTML;
            var template = Handlebars.default.compile(source);
            // var toolbarHTML = template({tools: toolNames});
            // toolbar.innerHTML = toolbarHTML;
        } 
    };

    return Templater; 
});
