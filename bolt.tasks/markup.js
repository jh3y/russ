module.exports = [
  {
    name: 'compile:markup',
    doc : 'compiles Pug(Jade)',
    pre : 'lint:markup',
    deps: [
      'fs',
      'glob',
      'winston',
      'pug',
      'path',
      'mkdirp'
    ],
    func: (fs, glob, winston, pug, path, mkdirp, instance) => {
      const outputDir = instance.config.paths.destinations.markup;
      mkdirp.sync(outputDir);
      glob(instance.config.paths.sources.docs, (err, files) => {
        for (const file of files) {
          try {
            const data = instance.config.pluginOpts.pug.data;
            const markup = pug.compileFile(`${process.cwd()}/${file}`)(data);
            const name = path.basename(file, '.pug');
            const loc = `${outputDir}${name}.html`;
            fs.writeFileSync(loc, markup);
            winston.success(`${loc} created!`);
          } catch (err) {
            instance.reject(err);
          }
        }
        instance.resolve();
      });
    }
  },
  {
    name: 'lint:markup',
    doc: 'lint markup src',
    deps: [
      'fs',
      'glob',
      'winston',
      'pug-lint'
    ],
    func: (fs, glob, w, p, instance) => {
      'use strict';
      try {
        const linter = new p();
        const config = require(`${process.cwd()}/.puglintrc`);
        linter.configure(config);
        glob(instance.config.paths.sources.markup, (err, files) => {
          for (const file of files) {
            const errors = linter.checkFile(file);
            if (errors.length > 0) {
              var errString = `\n\n${errors.length} error/s found in ${file} \n`;
              for (const err of errors)
                errString += `${err.msg} @ line ${err.line} column ${err.column}\n`;
              w.error(errString);
            }
          }
          instance.resolve();
        });
      } catch (err) {
        instance.reject(err);
      }
    }
  },
  {
    name: 'watch:markup',
    doc: 'watch and compile markup files',
    deps: [
      'winston',
      'gaze'
    ],
    func: function(w, g, b) {
      g(b.config.paths.sources.markup, (err, watcher) => {
        watcher.on('changed', function(file) {
          w.info(`${file} changed!`);
          b.run('compile:markup');
        });
      });
    }
  }
];
