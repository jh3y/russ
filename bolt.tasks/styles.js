module.exports = [
  {
    name: 'compile:styles',
    doc : 'compiles Stylus',
    deps: [
      'winston'
    ],
    func: function(winny) {
      winny.info('compiling away');
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
          b.runTask('compile:styles');
        });
      });
    }
  }
]
