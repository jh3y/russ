module.exports = [
  {
    name: 'compile:scripts',
    doc : 'compiles runtime JavaScript files',
    deps: [
      'winston'
    ],
    func: function(w, instance) {

      // @TODO: This breaks the profiler. So need to work out how to
      // profile only when necessary. Maybe with a UUID?
      w.info('hello');
      if (instance.env === 'dist') {
        w.info(`env: ${instance.env}`);
        instance.run('lint:styles').then(() => {
          instance.resolve();
        });
      } else
        setTimeout(instance.resolve, 500);
    }
  },
  {
    name: 'lint:scripts',
    doc: 'lints scripts using eslint',
    deps: [
      'winston'
    ],
    func: function(w, instance) {
      setTimeout(() => {
        instance.reject('hhhhmmm');
      }, 1000);
    }
  },
  {
    name: 'watch:scripts',
    doc: 'watch for script source changes then run and compile',
    deps: [
      'gaze',
      'winston'
    ],
    func: function(g, w, b) {
      g('./testSrc/**/*.js', (err, watcher) => {
        watcher.on('changed', (filepath) => {
          w.info(`${filepath} changed!`);
          b.run('compile:scripts');
        });
      });
    }
  }
];
