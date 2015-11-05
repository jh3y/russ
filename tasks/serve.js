(function(){
    var fs  = require('fs'),
    glob    = require('glob'),
    utils   = require('./utils'),
    serve = function() {
      /* CODE HERE */
    };
  if (require.main === module) {
    serve();
  } else {
    module.exports = serve;
  }
}(this));
