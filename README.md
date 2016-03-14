bolt
===

a super light task runner with simple syntax??? nah.

## bolt aims
* no task runner specific ecosystem lessening version mismatch risk
* no specific API to learn, you lift as much as you like
* a dumb task runner. Registers the tasks and runs them. Doesn't do anything magical. No specific syntax, you do what you want but you're not polluting `package.json` or creating a lengthy confusing `Makefile`.
* aims to encourage practices such as storing task var in .boltrc along with module options etc.


## bolt tasks

* be Generic
* be lightweight
* self documented
* super flexible
* no pipes, no config files, just pure JavaScript.
* Example task for a server: keys, params etc. `TBD`:
```js
module.exports = {
  name: 'TASK NAME',
  doc: 'BRIEF TASK DESCRIPTION/DOC',
  pre: [
    'PRETASK'
  ],
  post: [
    'POSTTASK'
  ],
  deps: [
    'browser-sync',
    'vinyl-source-stream',
    'vinyl-buffer',
    'vinyl-file'
  ],
  // The only bit, not massively happy about is passing all these params...
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
```

@jh3y 2016.
