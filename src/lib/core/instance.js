const winston  = require('winston'),
  fs           = require('fs'),
  BoltTask     = require('./task');


class BoltInstance {
  constructor() {
    /**
      * When creating an instance, we want to register tasks
      * gathered from "bolt.tasks" directory.
    */
    const runtime = '.boltrc';
    const path = `${process.cwd()}/${runtime}`;
    try {
      this.config = require(path);
    } catch (err) {
      winston.error('no way');
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
    const clean = (a) => {
      return a && (tasksToRun.indexOf(a) === -1);
    };
    let task = this.tasks[name];
    if (!task) throw Error('No such task...');
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
    if (task.sequence && task.sequence.length > 0)
      for (const t of task.sequence) getList(t);
    else
      getList(name);

    const run = (name) => {
      try {
        const task = new BoltTask(this, this.tasks[name]);
        task.run(env)
          .then(
            () => {
              winston.profile(name);
              if (tasks.next) {
                const nextTask = tasks.next();
                if (!nextTask.done)
                  run(nextTask.value);
                else
                  winston.profile('tasks')
              }
            }
          )
          .catch((err) => {
            winston.error(`Error: ${err}`);
          });
      } catch (err) {
        winston.silly(`Whoah whoah ${err}`);
      }
    };
    const tasks = tasksToRun[Symbol.iterator]();

    if (task.concurrent && task.concurrent.length > 0)
      for (const t of task.concurrent) run(t);
    else {
      if (task.sequence) winston.profile('tasks');
      run((tasks.next) ? tasks.next().value : tasks[0]);
    }
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

module.exports = BoltInstance;
