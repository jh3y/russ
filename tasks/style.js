(function(){
  var fs    = require('fs'),
    stylus  = require('stylus'),
    postcss = require('postcss'),
    utils   = require('./utils'),
    compile = function() {
      utils.readFiles('./src/stylus/{style,*}.stylus', true, function(files, paths) {
        stylus(files)
          .render(function(err, css) {
            var outputFile = function(styles) {
              fs.writeFileSync('public/test.css', styles);
            },
              minifyFile = function(styles) {
                console.info('MINIFYING.... brrr, greger');
                postcss([ require('autoprefixer') ])
                  .process(css, { from: 'public/test.css', to: 'test.min.css' })
                  .then(function (result) {
                      fs.writeFileSync('public/test.min.css', result.css);
                  });
              };
            if (!fs.existsSync('./public/')){
              fs.mkdirSync('./public/');
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
