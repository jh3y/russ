(function(){
  var glob  = require('glob'),
    fs      = require('fs'),
    stylus  = require('stylus'),
    postcss = require('postcss'),
    utils   = require('./utils'),
    compile = function() {
      glob('./src/stylus/{style,*}.stylus', {nosort: true}, function(err, files){
        utils.readFiles(files, function(actualFiles) {
          var styleContent = utils.concatFiles(actualFiles, files);
          stylus(styleContent)
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
      });
    };
  if (require.main === module) {
    compile();
  } else {
    module.exports = compile;
  }
}());
