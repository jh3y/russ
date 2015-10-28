(function(){
  var fs    = require('fs'),
    compile = require('./compile'),
    utils   = require('./utils'),
    compiler = {
      compile: compile
    },
    watch   = function() {
      var args = utils.getArgs(process.argv);
      if (args.name) {
        console.log(args.name, 'watcher started!');
      }
      fs.watch(args.dir, function(event, filename) {
        if (filename) {
          console.log(filename, 'changed!');
          compiler[args.exec]();
        }
      });
    };
  if (require.main === module) {
    watch();
  } else {
    module.exports = watch;
  }
}(this));
