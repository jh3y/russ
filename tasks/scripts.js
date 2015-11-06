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
        var outputPath = dest.scripts + config.name + '.js',
          scripts = coffee.compile(files, opts.coffee);
        if (args.licensed) {
          scripts = utils.license(scripts);
        }
        utils.writeFile(outputPath, scripts);
        if (args.minified) {
          scripts = uglify.minify(scripts, opts.uglify);
          utils.writeFile(outputPath.replace('.js', '.min.js'), scripts.code);
        }
      });
    };
  if (require.main === module) {
    compile();
  } else {
    module.exports = compile;
  }
}());
