define([], function() {
  String.prototype.endsWith = function(str) {
    return this.length >= str.length && this.substr(this.length - str.length) == str;
  };
});
