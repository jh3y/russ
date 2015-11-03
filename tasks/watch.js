(function(){
  var fs    = require('fs'),
    style   = require('./style'),
    script  = require('./script'),
    utils   = require('./utils'),
    compiler = {
      style: style,
      script: script
    },
    watch   = function() {
      var args = utils.getArgs(process.argv);
      if (typeof args.name === 'string') {
        console.log(args.name, 'watcher started!');
      }
      if (args.dir && args.exec) {
        fs.watch(args.dir, function(event, filename) {
          console.log(event);
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
