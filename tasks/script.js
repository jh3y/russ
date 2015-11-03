(function(){
  var fs    = require('fs'),
    coffee  = require('coffee-script'),
    utils   = require('./utils'),
    compile = function() {
      utils.readFiles('./src/coffee/*.coffee', true, function(files) {
        var scripts = coffee.compile(files, {});
        if (!fs.existsSync('./public/js/')){
          fs.mkdirSync('./public/js/');
        }
        scripts = utils.license(scripts);
        fs.writeFileSync('./public/js/script.js', scripts);
      });
    };
  if (require.main === module) {
    compile();
  } else {
    module.exports = compile;
  }
}());
