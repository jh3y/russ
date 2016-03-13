module.exports = [
  {
    name: 'compile:scripts',
    doc : 'compiles runtime JavaScript files',
    deps: [
      'bolt',
      'winston'
    ],
    func: function(b, w) {
      w.info('hello');
    }
  },
  {
    name: 'lint:scripts',
    doc: 'lints scripts using eslint',
    deps: [
      'winston'
    ],
    func: function(w, c) {
      w.success('LINTED');
      console.info(c);
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
    func: function(b, g, w, c) {
      g('./testSrc/**/*.js', (err, watcher) => {
        watcher.on('changed', (filepath) => {
          w.info(`${filepath} changed!`);
        });
      });
    }
  }
];
