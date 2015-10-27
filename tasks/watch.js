(function(){
  var fs    = require('fs'),
    compile = require('./compile'),
    watch   = function() {
      console.info('yes');
      fs.watch('src/stylus', function(event, filename) {
        console.log('event:', event);
        if (filename) {
          console.log(filename, 'changed');
          compile();
        }
      });
    };
  watch();
  module.exports = watch;
}(this));
