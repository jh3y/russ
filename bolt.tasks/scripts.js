// env, config, resolve, reject

module.exports = [
  {
    name: 'compile:scripts',
    doc : 'compiles runtime JavaScript files',
    deps: [
      'winston'
    ],
    func: function(w, e, c, resolve) {
      w.info('hello');
      resolve();
    }
  },
  {
    name: 'lint:scripts',
    doc: 'lints scripts using eslint',
    deps: [
      'winston'
    ],
    func: function(w, instance) {
      w.success('LINTED');
      w.info(`Environment: ${instance.env}`);
      setTimeout(() => {
        instance.reject('There was a linter error');
      }, 1000);
    }
  },
  {
    name: 'watch:scripts',
    doc: 'watch for script source changes then run and compile',
    deps: [
      'bolt',
      'gaze',
      'winston'
    ],
    func: function(b, g, w) {
      g('./testSrc/**/*.js', (err, watcher) => {
        watcher.on('changed', (filepath) => {
          w.info(`${filepath} changed!`);
        });
      });
    }
  }
];
