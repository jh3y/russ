const fs    = require('fs'),
  coffee  = require('coffee-script'),
  uglify  = require('uglify-js'),
  winston = require('winston'),
  config  = require('../bolt-config'),
  utils   = require('./utils'),
  src     = config.paths.sources,
  dest    = config.paths.destinations,
  opts    = config.pluginOpts;

const args = utils.getArgs(process.argv),
  compile  = function() {
    utils.get(src.scripts, function(files) {
      const outputPath = `${dest.scripts}${config.name}.js`,
        concatenated = utils.concatenate(files),
        result = coffee.compile(concatenated.toString('utf-8'), opts.coffee);

      utils.writeFile(outputPath, result);

      if (args.minified) {
        const minified = uglify.minify(result, opts.uglify);
        utils.writeFile(outputPath.replace('.js', '.min.js'), minified.code);
      }

    });
  };

if (require.main === module)
  compile();
else
  module.exports = compile;
