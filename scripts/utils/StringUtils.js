define([], function() {
  String.prototype.endsWith = function(str) {
    return this.length >= str.length && this.substr(this.length - str.length) == str;
  };

  String.prototype.capitalizeFirst = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  };
  
});
