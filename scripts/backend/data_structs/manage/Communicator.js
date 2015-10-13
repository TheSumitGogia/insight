define([
    "jquery",
    "underscore"
], function($, _) {

    var serverURL = "http://127.0.0.1/";
    var serverPortMap = {
        "test": 80,
        "select": 90
    };

    var Communicator = {
        
        get: function(server, mType, params) {
            var fullURL = serverURL + serverPortMap[server]
            var data = params;
            data["message"] = mType;
           
            var response;
            $.ajax({
                url: fullURL,
                async: false,
                crossDomain: true,
                data: data,
                dataType: "json",
                method: "GET",
                success: function(data, status, xhr) {
                    response = data;
                }
            });
            return response;
        }, 

        post: function(server, mType, params) {
            var fullURL = serverURL + serverPortMap[server]
            var data = params;
            data["message"] = mType;
           
            var response;
            $.ajax({
                url: fullURL,
                async: false,
                crossDomain: true,
                data: data,
                dataType: "json",
                method: "POST",
                success: function(data, status, xhr) {
                    response = data;
                }
            });
            return response;
        }
    };

    return Communicator;
});
