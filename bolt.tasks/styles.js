module.exports = [
  {
    name: 'compile:styles',
    doc : 'compiles Stylus',
    deps: [
      'winston'
    ],
    func: function(winny, env, config, resolve) {
      winny.info('hey');
      resolve();
    }
  },
  {
    name: 'lint:styles',
    doc: 'lint style src',
    deps: [
      'winston'
    ],
    func: (w, env, config, resolve) => {
      w.info('LINTED');
      resolve();
    }
  },
  {
    name: 'watch:styles',
    doc: 'watch and compile style files',
    deps: [
      'winston',
      'bolt',
      'gaze'
    ],
    func: function(w, b, g) {
      g('./testSrc/**/*.js', (err, watcher) => {
        watcher.on('changed', (file) => {
          w.info(`${file} changed!`);
          b.runTask('compile:styles');
        });
      });
    }
  }
];
