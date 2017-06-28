require('babel-polyfill');
const winston  = require('winston'),
  fs           = require('fs'),
  RussTask     = require('./task');

/**
  * @class RussInstance
  *
  * creates a new russInstance with an optional environment variable
  * @param env {string} - define runtime environment
  * @returns {Object} - russInstance
*/
class RussInstance {
  constructor(env) {
    let tasks;
    let config;
    try {
      config = require(`${process.cwd()}/.russrc`);
      tasks = fs.readdirSync('russ.tasks');
    } catch (err) { }
    tasks = fs.readdirSync('russ.tasks');
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
          let task;
          try {
            task = new RussTask(this, this.tasks[name]);
          } catch (err) {
            winston.error(err.toString());
            reject(err.toString());
          }
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
    const pushToPool = (name, parent) => {
      if (pool.indexOf(name) !== -1) return;
      const task = this.tasks[name];
      if (!task) throw Error(`Task ${name} is not defined...`);
      const clean = (a) => {
        return a && (pool.indexOf(a) === -1);
      };
      let tasks;
      if (task.sequence)
        tasks = task.sequence.filter(clean);
      else if (!task.concurrent)
        tasks = [task.pre, task.post].filter(clean);

      if (parent) {
        const parentTask = this.tasks[parent];
        const pIdx = pool.indexOf(parent);
        const idx = (name === parentTask.pre) ? pIdx : (pIdx + 1);
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
      const ERR_MSG = `Task ${opts.name} missing properties...`;
      const hasFunc = opts.func && typeof opts.func === 'function';
      const isDel   = opts.concurrent || opts.sequence;
      if (opts.name && opts.doc && (hasFunc || isDel))
        this.tasks[opts.name] = opts;
      else
        throw new Error(ERR_MSG);
    };
    if (!files || files.length === 0) throw new Error('No tasks defined in russ.tasks');
    this.tasks = {};
    for (const file of files) {
      const taskOpts = require(`${process.cwd()}/russ.tasks/${file}`);
      if (this.tasks[taskOpts.name])
        throw new Error(`Task ${taskOpts.name} already defined...`);
      if (Array.isArray(taskOpts))
        taskOpts.map(registerTask);
      else
        registerTask(taskOpts);
    }
  }
}

module.exports = RussInstance;
