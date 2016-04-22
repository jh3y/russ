const winston  = require('winston'),
  fs           = require('fs'),
  BoltTask     = require('./task');


// @TODO How can I run a task within a task dependant on a flag???
// @TODO Dont profile the tasks if we are running things concurrently.
// This is tricky when things have a pre and post I get that.
// @TODO Pass env down the line
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
    // Return promise here???
    return new Promise((resolve, reject) => {
      let sequenceName;
      const clean = (a) => {
        return a && (tasksToRun.indexOf(a) === -1);
      };
      const task = this.tasks[name];
      if (!task) throw Error('No such task...');
      const tasksToRun = [];
      // Need to do some recursion here on the first in the list...
      const getList = (name, parent) => {
        if (name) {
          if (!parent)
            tasksToRun.push(name);
          else {
            const parentTask = this.tasks[parent];
            const pIdx = tasksToRun.indexOf(parent);
            const idx = (name === parentTask.post) ? (pIdx + 1) : pIdx;
            tasksToRun.splice(idx, 0, name);
          }
          // Calculate pre/post
          const task = this.tasks[name];
          const tasks = [task.pre, task.post].filter(clean);
          for (const t of tasks) getList(t, name);
        }
      };
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
                  else {
                    if (sequenceName)
                      winston.profile(sequenceName);
                    else
                      winston.profile('tasks');
                    // if (task.sequence && task.sequence.length > 0)
                    resolve();
                  }
                }
              }
          )
          .catch((err) => {
            winston.error(`Error: ${err}`);
            reject(err);
          });
        } catch (err) {
          winston.silly(`Whoah whoah ${err}`);
          reject(err);
        }
      };
      const tasks = tasksToRun[Symbol.iterator]();

      if (task.concurrent && task.concurrent.length > 0)
        for (const t of task.concurrent) run(t);
      else {
        /**
        * Start a profile against the complete set of tasks being run.
        */
        if (task.sequence) {
          sequenceName = task.name;
          winston.info(`Running ${sequenceName}`);
          winston.profile(task.name);
        }
        if (task.pre || task.post) winston.profile('tasks');
        run((tasks.next) ? tasks.next().value : tasks[0]);
      }
    });
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
