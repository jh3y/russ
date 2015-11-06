(function(){
    var sync = require('browser-sync'),
      config  = require('../bolt-config'),
      opts    = config.pluginOpts,
    serve = function() {
      var server = sync.create();
      server.init(opts.browsersync);
    };
  if (require.main === module) {
    serve();
  } else {
    module.exports = serve;
  }
}(this));
