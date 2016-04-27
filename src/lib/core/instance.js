const winston  = require('winston'),
  fs           = require('fs'),
  BoltTask     = require('./task');

class BoltInstance {
  constructor(env) {
    const runtime = '.boltrc';
    const path = `${process.cwd()}/${runtime}`;
    try {
      this.config = require(path);
    } catch (err) {
      throw Error('missing .boltrc file');
    }
    this.env = env;
    this.tasks = {};
    this.pool = [];
    const tasks = fs.readdirSync('bolt.tasks');
    try {
      this.register(tasks);
    } catch (err) {
      winston.error(err.toString());
    }
  }

  run(name) {
    return new Promise((resolve, reject) => {
      try {
        const task = new BoltTask(this, this.tasks[name]);
        task.run(this.env)
        .then(
          () => {
            winston.profile(name);
            if (this.pool.next) {
              const nextTask = this.pool.next();
              if (!nextTask.done) {
                this.run(nextTask.value);
              } else {
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
    });
  }

  populatePool(name, parent) {
    const clean = (a) => {
      return a && (this.pool.indexOf(a) === -1);
    };
    if (name) {
      if (!parent)
        this.pool.push(name);
      else {
        const parentTask = this.tasks[parent];
        const pIdx = this.pool.indexOf(parent);
        const idx = (name === parentTask.post) ? (pIdx + 1) : pIdx;
        this.pool.splice(idx, 0, name);
      }
      // Calculate pre/post
      const task = this.tasks[name];
      const tasks = [task.pre, task.post].filter(clean);
      for (const t of tasks) this.populatePool(t, name);
    }
  }

  runTask(name) {
    const task = this.tasks[name];
    if (!task) throw Error('No such task...');

    return new Promise((resolve, reject) => {
      if (task.sequence && task.sequence.length > 0)
        for (const t of task.sequence) this.populatePool(t);
      else
        this.populatePool(name);

      // console.log(this.pool);
      this.pool = this.pool[Symbol.iterator]();

      if (task.sequence) {
        winston.info(`Running ${task.name}`);
      }
      if (task.concurrent && task.concurrent.length > 0) {
        for (const t of task.concurrent) this.runTask(t);
      } else {
        winston.profile('SOMETHING');
        this.run((this.pool.next) ? this.pool.next().value : this.pool[0])
          .then(() => {
            // TODO Only profiles if we have one task... else won't
            //  resolve... sequence or pool.length > 1 not working.
            winston.profile('SOMETHING');
            winston.info('FII');
            resolve();
          });
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
