module.exports = [
  {
    name: 'compile:styles',
    doc : 'compiles Stylus',
    deps: [
      'fs',
      'mkdirp',
      'cssnano',
      'path',
      'postcss',
      'stylus',
      'winston'
    ],
    func: function(fs, m, nano, p, postcss, s, w, instance) {
      'use strict';
      const src = instance.config.paths.sources;
      const dest = instance.config.paths.destinations;
      let outputPath = `${dest.styles}${instance.config.name}.css`;
      const stylString = fs.readFileSync(src.styles, 'utf-8');
      s(stylString)
        .set('paths', [
          `${p.dirname(src.styles)}`
        ])
        .render((err, css) => {
          m(p.dirname(outputPath), (err) => {
            if (err) throw Error(err);
            fs.writeFileSync(outputPath, css);
            if (instance.env === 'dist') {
              const nanoOpts = instance.config.pluginOpts.cssnano;
              outputPath = outputPath.replace('.css', '.min.css');
              postcss([ nano(nanoOpts) ])
                .process(css, {})
                .then(function(result) {
                  fs.writeFileSync(outputPath, result.css);
                });
            }
            instance.resolve();
          });
        });
    }
  },
  {
    name: 'lint:styles',
    doc: 'lint style src',
    deps: [
      'fs',
      'stylint',
      'winston'
    ],
    func: (fs, s, w, instance) => {
      const cb = () => {
        w.silly('LINTED');
        instance.resolve();
      };
      const rc = JSON.parse(fs.readFileSync('.stylintrc', 'utf-8'));
      s('testSrc/stylus/', rc, cb).create();
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
      g('./testSrc/**/*.styl', (err, watcher) => {
        watcher.on('changed', (file) => {
          w.info(`${file} changed!`);
          b.runTask('compile:styles');
        });
      });
    }
  }
];
