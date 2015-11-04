(function(){
  var fs    = require('fs'),
    stylus  = require('stylus'),
    postcss = require('postcss'),
    prefix  = require('autoprefixer'),
    nano    = require('cssnano'),
    utils   = require('./utils'),
    compile = function() {
      utils.readFiles('./src/stylus/{style,*}.stylus', true, function(files, paths) {
        stylus(files)
          .render(function(err, css) {
            var outputFile = function(styles) {
              fs.writeFileSync('public/css/test.css', styles);
            },
              minifyFile = function(styles) {
                var autoOpts = {};
                postcss([ prefix(autoOpts), nano({}) ])
                  .process(css, { from: 'public/css/test.css', to: 'test.min.css' })
                  .then(function (result) {
                      result.css = utils.license(result.css);
                      fs.writeFileSync('public/css/test.min.css', result.css);
                  });
              };
            if (!fs.existsSync('./public/css/')){
              fs.mkdirSync('./public/css/');
            }
            // Try prepending the license here.
            css = utils.license(css);
            outputFile(css);
            minifyFile();
          });
      });
    };
  if (require.main === module) {
    compile();
  } else {
    module.exports = compile;
  }
}());
