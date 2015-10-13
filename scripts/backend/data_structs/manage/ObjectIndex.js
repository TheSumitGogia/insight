define([
  "underscore",
  "backend/data_structs/manage/SelectionIndex"
], function(
  _,
  SelectionIndex
) {

  var ObjectIndex = {

    _globalIDCounter: 0,
    _objectMap: {},

    getObjectByID: function(id) {
      return this._objectMap[id];
    },

    insert: function(object) {
      object.identifier = this._globalIDCounter;
      this._globalIDCounter += 1;
      this._objectMap[object.identifier] = object;
      SelectionIndex.createTerminal(object.identifier);
    },

    remove: function(id) {
      delete this._objectMap[id];
    },
  
  };
  
  return ObjectIndex;
});
