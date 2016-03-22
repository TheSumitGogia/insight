define([
  "paper",
  "underscore",
  "backend/draw/objects/Geometry",
  "backend/generic/EventsMixin",
  "backend/generic/Communicator"
], function(
  paper,
  _,
  Geometry,
  EventsMixin,
  Communicator
) {

  var objects = null;

  var ObjectIndex = {

    create: function() { objects = []; },
      load: function(paperObjects) {
        _.each(paperObjects, function(object) { Geometry.convert(object); }); 
        objects = paperObjects;
      },

      getObjects: function() {
        return objects.slice();
      },

      getFeatures: function() {
        var reps = _.map(objects, function(object) {
          return object.features;
        });
      },

      getObjectByID: function(id) {
        return objects[id];
      },

      reset: function() {
        objects = null;  
      }

  };
  _.extend(ObjectIndex, EventsMixin);

  return ObjectIndex;
});
