(function(){
  var glob  = require('glob'),
    fs      = require('fs'),
    stylus  = require('stylus'),
    utils   = require('./utils'),
    compile = function() {
      glob('./src/stylus/{style,*}.stylus', {nosort: true}, function(err, files){
        utils.readFiles(files, function(actualFiles) {
          var styleContent = utils.concatFiles(actualFiles, files);
          stylus(styleContent)
            .render(function(err, css) {
              var outputFile = function(styles) {
                fs.writeFile('public/test.css', styles, function (err) {
                  if (err) throw err;
                  console.log('It\'s saved!');
                });
              };
              if (!fs.existsSync('./public/')){
                fs.mkdirSync('./public/');
              }
              // Try prepending the license here.
              utils.license(css, function(licensed) {
                outputFile(licensed);
              });
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
