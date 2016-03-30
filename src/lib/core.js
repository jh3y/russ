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
  runTask(name, env) {
    const run = (name) => {
      if (this.tasks[name])
        this.tasks[name].run(env)
          .then(() => {
            winston.info(`finished ${name}`);
            if (tasks.next) {
              const nextTask = tasks.next();
              if (!nextTask.done)
                run(nextTask.value);
            }
          })
          .catch((err) => {
            winston.error(`Error: ${err}`);
          });
      else
        throw Error('Whoah no such task!');
    };

    // Here need to work out the tasks that need to be ran.
    // let tasks = [task.pre, name, task.post];
    // let tasksToRun = [];
    // const clean = (a) => {
    //   return a && (tasksToRun.indexOf(a) === -1);
    // };
    // tasksToRun = tasks.filter(clean);
    // console.log(tasksToRun);

    let task = this.tasks[name];
    let tasksToRun = [];
    // Need to do some recursion here on the first in the list...
    let getList = (name) => {
      if (name) {
        const task = this.tasks[name];
        let tasks = [task.pre, task.name, task.post].filter(clean);
        tasks = task[Symbol.iterator]();
      }
    }

    getList(name);


    // task = new BoltTask(this, task);
    // try {
    //   task.run(env)
    //     .then(() => {
    //       winston.info(`Finished ${name}`);
    //     })
    //     .catch((err) => {
    //       winston.error(`Not today ${err}`);
    //     });
    // } catch (err) {
    //   winston.silly(`Not now bolt ${err}`);
    // }

    // let tasks = [task.pre, name, task.post];
    // const clean = (a) => {
    //   return a;
    // };
    // tasks = tasks.filter(clean);
    // if (tasks.length > 1)
    //   tasks = tasks[Symbol.iterator]();
    // // Iterate through tasks
    // run((tasks.next) ? tasks.next().value : tasks[0]);
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
      // Instead here we actually want to create a large reference Object
      // that can then be used when the amount of tasks is confirmed
      if (Array.isArray(taskOpts))
        for (const opt of taskOpts)
          // this.tasks[opt.name] = new BoltTask(this, opt);
          this.tasks[opt.name] = opt;
      else
        // this.tasks[taskOpts.name] = new BoltTask(this, taskOpts);
        this.tasks[taskOpts.name] = taskOpts;
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

// name, doc, func, pre, post
class BoltTask {
  constructor(parent, opts = defaults) {
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
          reject: reject
        });
    });
  }
}

exports.BoltInstance = BoltInstance;
exports.BoltTask = BoltTask;
