(function(){
  var fs    = require('fs'),
    style   = require('./style'),
    utils   = require('./utils'),
    compiler = {
      style: style
    },
    watch   = function() {
      var args = utils.getArgs(process.argv);
      if (args.name) {
        console.log(args.name, 'watcher started!');
      }
      if (args.dir && args.exec) {
        fs.watch(args.dir, function(event, filename) {
          if (filename) {
            console.log(filename, 'changed!');
            compiler[args.exec]();
          }
        });
      } else {
        throw('bolt: Directory and execution options must be defined for watch');
      }
    };
  if (require.main === module) {
    watch();
  } else {
    module.exports = watch;
  }
}(this));
