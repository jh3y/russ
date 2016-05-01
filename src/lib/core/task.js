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
    this.deps = [];
    if (opts.deps && opts.deps.length) {
      for (const dep of opts.deps) {
        let module;
        try {
          module = require(dep);
        } catch (err) {
          const path = `${process.cwd()}/node_modules/${dep}`;
          module = require(path);
        }
        this.deps.push(module);
      }
    }
  }
  /**
    * runs task
    @return {Promise} - Promise that informs BoltInstance of task outcome.
  */
  run() {
    /**
      * Returns a Promise so that Bolt knows to start on the next task.
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
        * addition to any configuration defined within .boltrc, environment and
        * the BoltInstance run. "run" is important for when we have a watcher
        * that wishes to run another task or wish to run a task within a task.
      */
      this.func(...this.deps, {
        env: this.parent.env,
        config: this.parent.config,
        resolve: resolve,
        reject: reject,
        run: this.parent.runTask.bind(this.parent)
      });
    });
  }
}

module.exports = BoltTask;
