const sync = require('browser-sync'),
  fs     = require('fs'),
  opts   = require('../bolt-config').pluginOpts,
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
  vinyl  = require('vinyl-file');

const serve = function() {
  const server = sync.create();
  server.init(opts.browsersync);
  server.watch('public/**/*.*', function(evt, file) {
    if (evt === 'change' && file.indexOf('.css') === -1) {
      server.reload();
    }
    if (evt === 'change' && file.indexOf('.css') !== -1) {
      vinyl.readSync(file)
        .pipe(source(file))
        .pipe(buffer())
        .pipe(server.stream());
    }
  });
};

if (require.main === module) {
  serve();
} else {
  module.exports = serve;
}
