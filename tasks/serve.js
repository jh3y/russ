(function(){
    var sync = require('browser-sync'),
      fs     = require('fs'),
      config = require('../bolt-config'),
      source = require('vinyl-source-stream'),
      buffer = require('vinyl-buffer'),
      v      = require('vinyl-file'),
      opts   = config.pluginOpts,
    serve = function() {
      var server = sync.create();
      server.init(opts.browsersync);
      server.watch('public/**/*.*', function(evt, file) {
        if (evt === 'change' && file.indexOf('.css') === -1) {
          console.info('was NOT css');
          server.reload();
        }
        if (evt === 'change' && file.indexOf('.css') !== -1) {
          console.log(file, fs.readFileSyn);
          v.readSync(file)
            .pipe(source(file))
            .pipe(buffer())
            .pipe(require('gulp-tap')(function(file) {
              console.log(file);
            }))
            .pipe(server.stream());
        }
      });
    };
  if (require.main === module) {
    serve();
  } else {
    module.exports = serve;
  }
}(this));
