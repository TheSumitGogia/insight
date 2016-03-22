define([
  "jquery",
  "underscore"
], function($, _) {

  var serverURL = "http://127.0.0.1:";
  var serverPortMap = {
    "test": 8080,
    "select": 1025 
  };

  var Communicator = {

    get: function(server, mType, params) {
      var fullURL = serverURL + serverPortMap[server];
      var data = params;
      data["message"] = mType;

      var response;
      $.ajax({
        url: fullURL,
        async: false,
        crossDomain: true,
        data: JSON.stringify(data),
        dataType: "json",
        method: "GET",
        success: function(data, status, xhr) {
          response = data["result"];
        }
      });
      return response;
    }, 

    post: function(server, mType, params) {
      var fullURL = serverURL + serverPortMap[server];
      var data = params;
      data["message"] = mType;

      var response;
      $.ajax({
        url: fullURL,
        async: false,
        crossDomain: true,
        data: JSON.stringify(data),
        dataType: "json",
        method: "POST",
        success: function(data, status, xhr) {
          response = data["result"];
        }
      });
      return response;
    }
  };

  return Communicator;
});
