module.exports = [
  {
    name: 'compile:scripts',
    doc : 'compiles runtime JavaScript files',
    deps: [
      'winston'
    ],
    func: function(w, instance) {
      w.info('hello');
      instance.resolve();
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
        // @TODO Find out how to throw an ERROR here and have bolt catch it.
        // throw Error('REALLY??');
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
