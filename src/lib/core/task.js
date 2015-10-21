require('babel-polyfill');
const winston  = require('winston');
/**
  * @class RussTask
  * task instance for russ.
  *
  * @constructor(instance, opts)
  * @param instance {russInstance} - defines task instance to bind to.
  * @param opts {Object} - defines logistics of task such as dependencies
  * pre/post hooks etc.
*/
class RussTask {
  constructor(instance, opts) {
    /* Assign all opts to task */
    Object.assign(this, opts, { instance });
    if (!this.instance) throw Error('Missing instance definition...');
    /**
      * If the task is dependant on modules and these are declared in the task
      * definition, require each and push into an Array to be used at run time
    */
    const hasFunc = (this.func && typeof this.func === 'function') || this.sequence || this.concurrent;
    if (!this.name || !this.doc || !hasFunc)
      throw Error('Task options missing properties...');
    this.deps = [];
    if (opts.deps && opts.deps.length)
      for (const dep of opts.deps) {
        let module;
        try {
          module = require(dep);
        } catch (err) {}
        try {
          const path = `${process.cwd()}/node_modules/${dep}`;
          module = require(path);
        } catch (err) {}
        if (!module) throw Error(`Module ${dep} not found, installed?`);
        this.deps.push(module);
      }
  }
  /**
    * runs task
    @return {Promise} - Promise that informs russInstance of task outcome.
  */
  run() {
    /**
      * Returns a Promise so that russ knows to start on the next task.
      * Be mindful that a watching task will never resolve so if we wish to run
      * more than one watch, we must use the "concurrent" option.
    */
    return new Promise((resolve, reject) => {
      /* give user feedback so they know which task is running */
      winston.info(`Running ${this.name}`);
      /**
        * profile the running time using winston so user can see which tasks
        * may be underperforming or should be refactored
      */
      winston.profile(this.name);
      /**
        * run function
        * passing the task dependencies(an Array of required modules) and a
        * reference Object that contains the resolve/reject for the Promise in
        * addition to any configuration defined within .russrc, environment and
        * the russInstance run. "run" is important for when we have a watcher
        * that wishes to run another task or wish to run a task within a task.
      */
      this.func(...this.deps, {
        __instance: this.instance,
        env       : this.instance.env,
        config    : this.instance.config,
        log       : winston,
        resolve   : resolve,
        reject    : reject,
        run       : this.instance.runTask.bind(this.instance)
      });
    });
  }
}

module.exports = RussTask;
