require('colors');
const winston  = require('winston'),
  fs           = require('fs');

class BoltInstance {
  constructor() {
    /**
      * When creating an instance, we want to register tasks
      * gathered from "bolt.tasks" directory.
    */
    try {
      const runtime = '.boltrc';
      const path = `${process.cwd()}/${runtime}`;
      this.config = require(path);
    } catch (err) {
      throw Error('missing .boltrc file');
    }

    this.tasks = {};
    const tasks = fs.readdirSync('bolt.tasks');
    try {
      this.registerTasks(tasks);
    } catch (err) {
      winston.error(err.toString());
    }
  }
  runTask(name) {
    if (this.tasks[name])
      this.tasks[name].run();
    else
      throw Error(`no such task ${name}`);
  }
  info() {
    let taskList = '\n';
    if (Object.keys(this.tasks).length > 0)
      for (const task in this.tasks)
        taskList += `     ${task.green}: ${this.tasks[task].doc.cyan}\n`;
    const header = 'Available task to run:\n';
    winston.info(`${header}${taskList}`);
  }
  registerTasks(files) {
    if (files.length === 0) throw new Error('No tasks in ./bolt.tasks/');
    for (const file of files) {
      const taskOpts = require(`${process.cwd()}/bolt.tasks/${file}`);
      if (Array.isArray(taskOpts))
        for (const opt of taskOpts)
          this.tasks[opt.name] = new BoltTask(opt, this);
      else
        this.tasks[taskOpts.name] = new BoltTask(taskOpts, this);
    }
  }
}


const defaults = {
  name: 'compile:scripts',
  doc : 'compiles runtime JavaScript files',
  deps: [
    'winston'
  ],
  func: function(w) {
    w.info('hello');
  }
};

/**
  *
  * be Generic
  * be lightweight
  * self documented
  * super flexible
  * no pipes, no config files, just pure script.
  *
*/
class BoltTask {
  constructor(opts = defaults, daddy) {
    this.name = opts.name;
    this.doc  = opts.doc;
    this.func = opts.func;
    this.parent = daddy;
    if (opts.deps.length > 0) {
      this.deps = [];
      for (const dep of opts.deps)
        if (dep !== 'bolt')
          this.deps.push(require(dep));
        else
          this.deps.push(daddy);
    }
  }
  info() {
    winston.info(`${this.name}: ${this.doc}`);
  }
  run() {
    winston.info(`Running ${this.name}`);
    // gather deps here and pass them in.
    if (this.func && typeof this.func === 'function')
      // convert array to parameters here and pass into function.
      this.func(...this.deps, this.parent.config);
  }
}

exports.BoltInstance = BoltInstance;
exports.BoltTask = BoltTask;
