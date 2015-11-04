(function(){
    var fs  = require('fs'),
    utils   = require('./utils'),
    compile = function() {
      /* CODE HERE */
    };
  if (require.main === module) {
    compile();
  } else {
    module.exports = compile;
  }
}(this));
