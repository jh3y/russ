const winston  = require('winston');
/**
  * @class BoltTask
  * task instance for Bolt.
  *
  * @constructor(parent, opts)
  * @param parent {BoltInstance} - defines task parent to bind to.
  * @param opts {Object} - defines logistics of task such as dependencies
  * pre/post hooks etc.
*/
class BoltTask {
  constructor(parent, opts) {
    /* Assign all opts to task */
    Object.assign(this, opts);
    this.parent = parent;
    /**
      * If the task is dependant on modules and these are declared in the task
      * definition, require each and push into an Array to be used at run time
    */
    if (opts.deps.length > 0) {
      this.deps = [];
      for (const dep of opts.deps)
        this.deps.push(require(dep));
    }
  }
  /**
    * runs task with given environment
    *
    * @param env {String} - defines an environment flag for a task to reference.
    * For example; a compilation task might reference a "deploy" flag to know
    * that optimisation is required when compiling.
  */
  run(env) {
    /**
      * Returns a Promise so that Bolt knows to start on the next task.
      * Be mindful that a watching task will never resolve so if we wish to run
      * more than one watch, we must use "concurrent".
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
        * if task has a function and it is a function run that function passing
        * the task dependencies(an Array of required modules) and a reference
        * Object that contains the resolve/reject for the Promise in addition
        * to any configuration defined within .boltrc, environment and the
        * instance run. Instance run is important for when we have a watcher
        * that wishes to run another task.
      */
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

module.exports = BoltTask;
