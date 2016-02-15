(function(){
    var fs  = require('fs'),
    jade    = require('jade'),
    bsync   = require('browser-sync'),
    glob    = require('glob'),
    config  = require('../bolt-config'),
    src     = config.paths.sources,
    dest    = config.paths.destinations,
    opts    = config.pluginOpts,
    utils   = require('./utils'),
    args    = utils.getArgs(process.argv),
    compile = function() {
      glob(src.markup, {nosort: true}, function(err, files) {
        for (var i = 0; i < files.length; i++) {
          var markup = jade.renderFile(files[i], {
            pretty: true
          });
          var filename = files[i].substr(files[i].lastIndexOf('/')).replace('.jade', '.html');
          utils.writeFile(dest.markup + filename, markup);
        }
      });
    };
  if (require.main === module) {
    compile();
  } else {
    module.exports = compile;
  }
}(this));
