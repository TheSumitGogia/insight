define([
  "state_management/Toolbar",
  "state_management/IOBar"
], function(toolbar, iobar) {
  return function() {
    toolbar();
    iobar();
  };
});
