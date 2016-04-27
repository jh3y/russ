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
    const tasks = fs.readdirSync('bolt.tasks');
    try {
      this.register(tasks);
    } catch (err) {
      winston.error(err.toString());
    }
  }

  run(taskPool) {
    const tasks = taskPool[Symbol.iterator]();
    const exec = (name, resolve, reject) => {
      try {
        const task = new BoltTask(this, this.tasks[name]);
        task.run(this.env)
          .then(
            () => {
              winston.profile(name);
              if (tasks.next) {
                const nextTask = tasks.next();
                if (!nextTask.done) {
                  exec(nextTask.value, resolve, reject);
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
    };
    return new Promise((resolve, reject) => {
      exec(tasks.next().value, resolve, reject);
    });
  }

  getPool(name) {
    const pool = [];
    const clean = (a) => {
      return a && (pool.indexOf(a) === -1);
    };
    const pushToPool = (name, parent) => {
      const task = this.tasks[name];
      let tasks;
      if (task.sequence)
        tasks = task.sequence.filter(clean);
      else if (task.concurrent)
        tasks = task.concurrent.filter(clean);
      else
        tasks = [task.pre, task.post].filter(clean);

      if (parent) {
        const parentTask = this.tasks[parent];
        const pIdx = pool.indexOf(parent);
        const idx = (name === parentTask.post) ? (pIdx + 1) : pIdx;
        pool.splice(idx, 0, name);
      } else if (!task.sequence) pool.push(name);

      const newParent = (task.sequence) ? undefined : name;
      if (tasks.length > 0)
        for (const t of tasks) pushToPool(t, newParent);
    };
    pushToPool(name);
    return pool;
  }

  runTask(name) {
    console.log(name, this);
    const task = this.tasks[name];
    if (!task) throw Error('No such task...');
    if (!task.concurrent) {
      const taskPool = this.getPool(name);
      console.log(taskPool);
      return new Promise((resolve, reject) => {
        if (task.sequence)
          winston.info(`Running ${task.name}`);
        if (task.sequence || taskPool.length > 1)
          winston.profile('SOMETHING');
        this.run(taskPool)
          .then(() => {
            winston.profile('SOMETHING');
            winston.info('FII');
            resolve();
          });
        // }
      });
    } else {
      winston.profile(name);
      const concurrentTasks = task.concurrent.map(this.runTask.bind(this));
      Promise.all(concurrentTasks)
        .then(() => {
          winston.profile(name);
        });
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
