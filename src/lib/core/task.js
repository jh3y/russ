const winston  = require('winston');

class BoltTask {
  constructor(parent, opts) {
    Object.assign(this, opts);
    this.parent = parent;
    if (opts.deps.length > 0) {
      this.deps = [];
      for (const dep of opts.deps)
        this.deps.push(require(dep));
    }
  }
  run(env) {
    return new Promise((resolve, reject) => {
      winston.info(`Running ${this.name}`);
      winston.profile(this.name);
      if (this.func && typeof this.func === 'function')
        this.func(...this.deps, {
          env: env,
          config: this.parent.config,
          resolve: resolve,
          reject: reject,
          run: this.parent.runTask.bind(this.parent)
        });
    });
  }
}

module.exports = BoltTask;
