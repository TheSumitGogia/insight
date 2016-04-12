define([
  "jquery",
  "underscore"
], function($, _) {

  var serverURL = "http://127.0.0.1:";
  var serverPortMap = {
    "image": 8080,
    "select": 1025 
  };

  var index = null;
  var Communicator = {

    get: function(server, mType, params) {
      console.log("GET CURRENT INDEX", index);
      var fullURL = serverURL + serverPortMap[server];
      var data = params;
      data["message"] = mType;
      if (index != null) {
        data["index"] = index;
      }

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
          console.log("RESPONSE", response);
          if (!isNaN(response)) {
            index = parseInt(response);
          }
        }
      });
      return response;
    }, 

    post: function(server, mType, params) {
      console.log("POST CURRENT INDEX", index);
      var fullURL = serverURL + serverPortMap[server];
      var data = params;
      data["message"] = mType;
      if (index != null) {
        data["index"] = index;
      }

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
          console.log("RESPONSE", response);
          if (!isNaN(response)) {
            console.log("whatup");
            index = parseInt(response);
          }
        }
      });
      return response;
    }
  };

  return Communicator;
});
