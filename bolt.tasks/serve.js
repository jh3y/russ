module.exports = {
  name: 'server',
  doc: 'set up BrowserSync static server with liveReload and CSS injection',
  deps: [
    'browser-sync',
    'vinyl-source-stream',
    'vinyl-buffer',
    'vinyl-file'
  ],
  pre: 'compile',
  func: (bs, vss, vb, vf, bolt) => {
    const server = bs.create();
    const pluginOpts = bolt.config.pluginOpts;
    server.init(pluginOpts.browsersync);
    server.watch('public/**/*.*', (evt, file) => {
      if (evt === 'change' && file.indexOf('.css') === -1)
        server.reload();
      if (evt === 'change' && file.indexOf('.css') !== -1)
        vf.readSync(file)
          .pipe(vss(file))
          .pipe(vb())
          .pipe(server.stream());
    });
  }
};
