(function(){
  var stylus = require('stylus'),
    fs       = require('fs'),
    glob     = require('glob'),
    utils    = require('./utils'),
    style    = require('./style'),
    compile  = function() {
      style();
    };
  if (require.main === module) {
    compile();
  } else {
    module.exports = compile;
  }
}(this));
