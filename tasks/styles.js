(function(){
  var fs    = require('fs'),
    stylus  = require('stylus'),
    postcss = require('postcss'),
    nano    = require('cssnano'),
    config  = require('../bolt-config'),
    src     = config.paths.sources,
    dest    = config.paths.destinations,
    opts    = config.pluginOpts,
    utils   = require('./utils'),
    args    = utils.getArgs(process.argv),
    compile = function() {
      utils.readFiles(src.styles, true, function(files) {
        var outputPath = dest.styles + config.name + '.css',
          nanoOpts = opts.cssnano,
          outputFile = function(styles, minified) {
            var dest = outputPath;
            if (minified) {
              dest = dest.replace('.css', '.min.css');
              nanoOpts.core = true;
            }
            postcss([ nano(nanoOpts) ])
              .process(styles, {})
              .then(function (result) {
                  utils.writeFile(dest, result.css);
              });
          };
        stylus(files)
          .render(function(err, css) {
            if (args.licensed) {
              css = utils.license(css);
            }
            outputFile(css, false);
            if (args.minified) {
              outputFile(css, true);
            }
          });
      });
    };
  if (require.main === module) {
    compile();
  } else {
    module.exports = compile;
  }
}());
