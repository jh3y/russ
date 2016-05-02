const winston  = require('winston'),
  fs           = require('fs'),
  BoltTask     = require('./task');

/**
  * @class BoltInstance
  *
  * creates a new BoltInstance with an optional environment variable
  * @param env {string} - define runtime environment
  * @returns {Object} - BoltInstance
*/
class BoltInstance {
  constructor(env) {
    let tasks;
    let config;
    try {
      config = require(`${process.cwd()}/.boltrc`);
      tasks = fs.readdirSync('bolt.tasks');
    } catch (err) {
      throw Error('Missing bolt files...');
    }
    this.env = env;
    this.config = config;
    this.register(tasks);
    return this;
  }

  run(taskPool) {
    const tasks = taskPool[Symbol.iterator]();
    const exec = (name, resolve, reject) => {
      const cb = () => {
        winston.profile(name);
        if (tasks.next) {
          const nextTask = tasks.next();
          if (!nextTask.done)
            exec(nextTask.value, resolve, reject);
          else
            resolve();
        }
      };
      const errCb = (err) => {
        if (err) winston.error(`Error: ${err}`);
        reject(err);
      };
      try {
        const taskObj = this.tasks[name];
        if (taskObj.concurrent) {
          const tasks = taskObj.concurrent.map(this.runTask.bind(this));
          Promise.all(tasks)
            .then(cb)
            .catch(errCb);
        } else {
          const task = new BoltTask(this, this.tasks[name]);
          task.run(this.env)
            .then(cb)
            .catch(errCb);
        }
      } catch (err) {
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
      else if (!task.concurrent)
        tasks = [task.pre, task.post].filter(clean);

      if (parent) {
        const parentTask = this.tasks[parent];
        const pIdx = pool.indexOf(parent);
        const idx = (name === parentTask.post) ? (pIdx + 1) : pIdx;
        pool.splice(idx, 0, name);
      } else if (!task.sequence) pool.push(name);

      const newParent = (task.sequence) ? undefined : name;
      if (tasks && tasks.length > 0)
        for (const t of tasks) pushToPool(t, newParent);
    };
    pushToPool(name);
    return pool;
  }

  runTask(name) {
    const task = this.tasks[name];
    if (!task) throw Error('No such task...');
    const taskPool = this.getPool(name);
    return new Promise((resolve, reject) => {
      if (task.sequence || task.concurrent) {
        winston.info(`Running ${task.name}`);
        winston.profile(task.name);
      }
      this.run(taskPool)
        .then(() => {
          if (task.sequence || task.concurrent)
            winston.profile(task.name);
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  info() {
    const header = 'Available task to run:\n';
    let taskList = '\n';
    if (Object.keys(this.tasks).length > 0)
      for (const task in this.tasks)
        taskList += `     ${task.green}: ${this.tasks[task].doc.cyan}\n`;
    winston.info(`${header}${taskList}`);
  }

  /**
    * populates instance tasks
    * @param files {Array} array of task objects to use when registering
  */
  register(files) {
    const registerTask = (opts) => {
      const ERR_MSG = 'Task missing properties...';
      const hasFunc = opts.func && typeof opts.func === 'function';
      const isDel   = opts.concurrent || opts.sequence;
      if (opts.name && opts.doc && (hasFunc || isDel))
        this.tasks[opts.name] = opts;
      else
        throw new Error(ERR_MSG);
    };
    if (files.length === 0) throw new Error('No tasks defined in bolt.tasks');
    this.tasks = {};
    for (const file of files) {
      const taskOpts = require(`${process.cwd()}/bolt.tasks/${file}`);
      if (this.tasks[taskOpts.name])
        throw new Error(`Task ${taskOpts.name} already defined...`);
      if (Array.isArray(taskOpts))
        taskOpts.map(registerTask);
      else
        registerTask(taskOpts);
    }
  }
}

module.exports = BoltInstance;
