(function(){
    var fs  = require('fs'),
    glob    = require('glob'),
    utils   = require('./utils'),
    func = function() {
      /* CODE HERE */
    };
  if (require.main === module) {
    func();
  } else {
    module.exports = func;
  }
}(this));
