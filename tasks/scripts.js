(function(){
  var fs    = require('fs'),
    coffee  = require('coffee-script'),
    uglify  = require('uglify-js'),
    config  = require('../bolt-config'),
    src     = config.paths.sources,
    dest    = config.paths.destinations,
    opts    = config.pluginOpts,
    utils   = require('./utils'),
    args    = utils.getArgs(process.argv),
    compile = function() {
      utils.readFiles(src.scripts, true, function(files) {
        var scripts = coffee.compile(files, opts.coffee);
        utils.checkPath(dest.scripts);
        if (args.licensed) {
          scripts = utils.license(scripts);
        }
        fs.writeFileSync(dest.scripts + config.name + '.js', scripts);
        if (args.minified) {
          scripts = uglify.minify(scripts, {
            output: {
              comments: true
            },
            fromString: true
          });
          fs.writeFileSync(dest.scripts + config.name + '.min.js', scripts.code);
        }
      });
    };
  if (require.main === module) {
    compile();
  } else {
    module.exports = compile;
  }
}());
