(function(){
  var stylus = require('stylus'),
    fs       = require('fs'),
    glob     = require('glob'),
    utils    = require('./utils'),
    compile  = function() {
      var styleContent, result;
      glob('./src/stylus/{style,base}.stylus', {nosort: true}, function(err, files){
        utils.readFiles(files, function(err, actualFiles) {
          styleContent = utils.concatFiles(actualFiles);
          styleContent = stylus(styleContent)
                          .set('filename', 'bolt.css')
                          .render(function(err, css) {
                            result = css;
                            if (!fs.existsSync('./public/')){
                              fs.mkdirSync('./public/');
                            }
                            fs.writeFile('public/test', css, function (err) {
                              if (err) throw err;
                              console.log('It\'s saved!');
                            });
                          });
        });
      });
    };
  module.exports = compile;
}());
