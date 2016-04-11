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
      this.register(tasks);
    } catch (err) {
      winston.error(err.toString());
    }
  }
  runTask(name) {
    const clean = (a) => {
      return a && (tasksToRun.indexOf(a) === -1);
    };
    let task = this.tasks[name];
    let tasksToRun = [];
    // Need to do some recursion here on the first in the list...
    let getList = (name, parent) => {
      if (name) {
        if (!parent)
          tasksToRun.push(name);
        else {
          const parentTask = this.tasks[parent];
          const pIdx = tasksToRun.indexOf(parent);
          const idx = (name === parentTask.post) ? (pIdx + 1): pIdx;
          tasksToRun.splice(idx, 0, name);
        }
        // Calculate pre/post
        const task = this.tasks[name];
        let tasks = [task.pre, task.post].filter(clean);
        for (const t of tasks) getList(t, name);
      }
    }
    getList(name);
    const run = (name) => {
      try {
        const task = new BoltTask(this, this.tasks[name]);
        task.run()
          .then(() => {
            winston.info(`Finished ${name}`);
            if (tasks.next) {
              const nextTask = tasks.next();
              if (!nextTask.done)
                run(nextTask.value);
            }
          })
          .catch((err) => {
            winston.error(`Error: ${err}`);
          });
      } catch (err) {
        winston.silly(`Whoah whoah ${err}`);
      }
    };
    const tasks = tasksToRun[Symbol.iterator]();
    // Iterate through tasks
    run((tasks.next) ? tasks.next().value : tasks[0]);
  }
  info() {
    let taskList = '\n';
    if (Object.keys(this.tasks).length > 0)
      for (const task in this.tasks)
        taskList += `     ${task.green}: ${this.tasks[task].doc.cyan}\n`;
    const header = 'Available task to run:\n';
    winston.info(`${header}${taskList}`);
  }
  register(files) {
    if (files.length === 0) throw new Error('No tasks in ./bolt.tasks/');
    for (const file of files) {
      const taskOpts = require(`${process.cwd()}/bolt.tasks/${file}`);
      if (Array.isArray(taskOpts))
        for (const opt of taskOpts)
          this.tasks[opt.name] = opt;
      else
        this.tasks[taskOpts.name] = taskOpts;
    }
  }
}


// const defaults = {
//   name: 'compile:scripts',
//   doc : 'compiles runtime JavaScript files',
//   deps: [
//     'winston'
//   ],
//   func: function(w) {
//     w.info('hello');
//   }
// };

// name, doc, func, pre, post
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

exports.BoltInstance = BoltInstance;
exports.BoltTask = BoltTask;
