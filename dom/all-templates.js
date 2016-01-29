define(['handlebars.runtime'], function(Handlebars) {
  Handlebars = Handlebars["default"];  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['steps'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"item steps\" id=\"steps"
    + alias4(((helper = (helper = helpers.testIndex || (depth0 != null ? depth0.testIndex : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"testIndex","hash":{},"data":data}) : helper)))
    + "-"
    + alias4(((helper = (helper = helpers.taskIndex || (depth0 != null ? depth0.taskIndex : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"taskIndex","hash":{},"data":data}) : helper)))
    + "-"
    + alias4(((helper = (helper = helpers.stepsIndex || (depth0 != null ? depth0.stepsIndex : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"stepsIndex","hash":{},"data":data}) : helper)))
    + "\">\n    <div class=\"right floated content\">\n        <i class=\"close icon\"></i> \n    </div>\n    <div class=\"stepstext\" id=\"stepstext"
    + alias4(((helper = (helper = helpers.testIndex || (depth0 != null ? depth0.testIndex : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"testIndex","hash":{},"data":data}) : helper)))
    + "-"
    + alias4(((helper = (helper = helpers.taskIndex || (depth0 != null ? depth0.taskIndex : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"taskIndex","hash":{},"data":data}) : helper)))
    + "-"
    + alias4(((helper = (helper = helpers.stepsIndex || (depth0 != null ? depth0.stepsIndex : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"stepsIndex","hash":{},"data":data}) : helper)))
    + "\">\n        Steps "
    + alias4(((helper = (helper = helpers.stepsIndex || (depth0 != null ? depth0.stepsIndex : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"stepsIndex","hash":{},"data":data}) : helper)))
    + " \n    </div>\n</div>\n";
},"useData":true});
templates['task'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.steps,depth0,{"name":"steps","hash":{"stepsIndex":(data && data.index),"taskIndex":(depth0 != null ? depth0.taskIndex : depth0),"testIndex":(depth0 != null ? depth0.testIndex : depth0)},"data":data,"indent":"        ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"item task\" id=\"task"
    + alias4(((helper = (helper = helpers.testIndex || (depth0 != null ? depth0.testIndex : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"testIndex","hash":{},"data":data}) : helper)))
    + "-"
    + alias4(((helper = (helper = helpers.taskIndex || (depth0 != null ? depth0.taskIndex : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"taskIndex","hash":{},"data":data}) : helper)))
    + "\">\n    <div class=\"right floated content\">\n        <i class=\"close icon\"></i>\n    </div>\n    <div class=\"tasktext\" id=\"tasktext"
    + alias4(((helper = (helper = helpers.testIndex || (depth0 != null ? depth0.testIndex : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"testIndex","hash":{},"data":data}) : helper)))
    + "-"
    + alias4(((helper = (helper = helpers.taskIndex || (depth0 != null ? depth0.taskIndex : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"taskIndex","hash":{},"data":data}) : helper)))
    + "\">\n        Task "
    + alias4(((helper = (helper = helpers.taskIndex || (depth0 != null ? depth0.taskIndex : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"taskIndex","hash":{},"data":data}) : helper)))
    + "\n    </div>\n    <div class=\"list stepslist\" id=\"stepslist"
    + alias4(((helper = (helper = helpers.testIndex || (depth0 != null ? depth0.testIndex : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"testIndex","hash":{},"data":data}) : helper)))
    + "-"
    + alias4(((helper = (helper = helpers.taskIndex || (depth0 != null ? depth0.taskIndex : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"taskIndex","hash":{},"data":data}) : helper)))
    + "\">\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.stepsList : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "    </div>   \n</div>\n";
},"usePartial":true,"useData":true});
templates['testlist'] = template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "    <div class=\"item test\" id=\"test"
    + alias4(((helper = (helper = helpers.index || (data && data.index)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"index","hash":{},"data":data}) : helper)))
    + "\">\n        <div class=\"testtext\" id=\"testtext"
    + alias4(((helper = (helper = helpers.index || (data && data.index)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"index","hash":{},"data":data}) : helper)))
    + "\">\n            "
    + alias4(container.lambda((depth0 != null ? depth0.image : depth0), depth0))
    + "\n        </div>\n        <div class=\"list tasklist\" id=\"tasklist"
    + alias4(((helper = (helper = helpers.index || (data && data.index)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"index","hash":{},"data":data}) : helper)))
    + "\">\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.tasks : depth0),{"name":"each","hash":{},"fn":container.program(2, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "        </div>\n    </div>\n";
},"2":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.task,depth0,{"name":"task","hash":{"taskIndex":(data && data.index),"testIndex":(container.data(data, 1) && container.data(data, 1).index)},"data":data,"indent":"            ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "<div id=\"testList\" class=\"ui middle aligned celled list\">\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.tests : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</div>\n";
},"usePartial":true,"useData":true,"useDepths":true});
return templates;
});