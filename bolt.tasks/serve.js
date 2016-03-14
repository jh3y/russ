module.exports = {
  name: 'server',
  doc: 'set up BrowserSync static server with liveReload and CSS injection',
  pre: [
    'lint:scripts'
  ],
  post: [

  ],
  deps: [
    'browser-sync',
    'vinyl-source-stream',
    'vinyl-buffer',
    'vinyl-file'
  ],
  func: (bs, vss, vb, vf, env, config) => {
    const server = bs.create();
    const pluginOpts = config.pluginOpts;
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
