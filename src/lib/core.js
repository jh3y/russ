require('colors');
const winston  = require('winston'),
  fs           = require('fs');

class BoltInstance {
  constructor() {
    /**
      * When creating an instance, we want to register tasks
      * gathered from "bolt.tasks" directory.
    */
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
  * whar does a task need to do?
  *
  * be Generic
  * be lightweight
  * self documented
  * super flexible
  * no pipes, no config files, just pure script.
  *
  * Can I do bolt scripts styles markup
  * Should this actually be watch glob?
  * bolt watch -d src/js -t scripts
  * I think maybe because watching is quite a challenge. If you want to create
  * a watcher, you create it as a task that runs???
  * should it really be one task per file or can I have multiple?? as an array?
  * can't differentiate between type array and type object, length???
  *
*/
class BoltTask {
  constructor(opts = defaults, daddy) {
    this.name = opts.name;
    this.doc  = opts.doc;
    this.func = opts.func;
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
      this.func(...this.deps);
  }
}

exports.BoltInstance = BoltInstance;
exports.BoltTask = BoltTask;
