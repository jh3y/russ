(function(){
  var fs    = require('fs'),
    compile = require('./compile'),
    watch   = function() {
      console.log(process.argv  );
      fs.watch('src/coffee', function(event, filename) {
        if (filename) {
          console.log(filename, 'changed!');
          compile();
        }
      });
    };
  if (require.main === module) {
    watch();
  } else {
    module.exports = watch;
  }
}(this));
