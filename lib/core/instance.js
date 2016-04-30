'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var winston = require('winston'),
    fs = require('fs'),
    BoltTask = require('./task');

/**
  * @class BoltInstance
  *
  * creates a new BoltInstance with an optional environment variable
  * @param env {string} - define runtime environment
  * @returns {Object} - BoltInstance
*/

var BoltInstance = function () {
  function BoltInstance(env) {
    _classCallCheck(this, BoltInstance);

    var tasks = void 0;
    var config = void 0;
    try {
      config = require(process.cwd() + '/.boltrc');
      tasks = fs.readdirSync('bolt.tasks');
    } catch (err) {
      throw Error('Missing bolt files...');
    }
    this.env = env;
    this.config = config;
    this.register(tasks);
    return this;
  }

  _createClass(BoltInstance, [{
    key: 'run',
    value: function run(taskPool) {
      var _this = this;

      var tasks = taskPool[Symbol.iterator]();
      var exec = function exec(name, resolve, reject) {
        var cb = function cb() {
          winston.profile(name);
          if (tasks.next) {
            var nextTask = tasks.next();
            if (!nextTask.done) exec(nextTask.value, resolve, reject);else resolve();
          }
        };
        var errCb = function errCb(err) {
          if (err) winston.error('Error: ' + err);
          reject(err);
        };
        try {
          var taskObj = _this.tasks[name];
          if (taskObj.concurrent) {
            var _tasks = taskObj.concurrent.map(_this.runTask.bind(_this));
            Promise.all(_tasks).then(cb).catch(errCb);
          } else {
            var task = new BoltTask(_this, _this.tasks[name]);
            task.run(_this.env).then(cb).catch(errCb);
          }
        } catch (err) {
          reject(err);
        }
      };
      return new Promise(function (resolve, reject) {
        exec(tasks.next().value, resolve, reject);
      });
    }
  }, {
    key: 'getPool',
    value: function getPool(name) {
      var _this2 = this;

      var pool = [];
      var clean = function clean(a) {
        return a && pool.indexOf(a) === -1;
      };
      var pushToPool = function pushToPool(name, parent) {
        var task = _this2.tasks[name];
        var tasks = void 0;
        if (task.sequence) tasks = task.sequence.filter(clean);else if (!task.concurrent) tasks = [task.pre, task.post].filter(clean);

        if (parent) {
          var parentTask = _this2.tasks[parent];
          var pIdx = pool.indexOf(parent);
          var idx = name === parentTask.post ? pIdx + 1 : pIdx;
          pool.splice(idx, 0, name);
        } else if (!task.sequence) pool.push(name);

        var newParent = task.sequence ? undefined : name;
        if (tasks && tasks.length > 0) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = tasks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var _t = _step.value;
              pushToPool(_t, newParent);
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
        }
      };
      pushToPool(name);
      return pool;
    }
  }, {
    key: 'runTask',
    value: function runTask(name) {
      var _this3 = this;

      var task = this.tasks[name];
      if (!task) throw Error('No such task...');
      var taskPool = this.getPool(name);
      return new Promise(function (resolve, reject) {
        if (task.sequence || task.concurrent) {
          winston.info('Running ' + task.name);
          winston.profile(task.name);
        }
        _this3.run(taskPool).then(function () {
          if (task.sequence || task.concurrent) winston.profile(task.name);
          resolve();
        }).catch(function (err) {
          if (err) winston.error(err.toString());
          reject();
        });
      });
    }
  }, {
    key: 'info',
    value: function info() {
      var header = 'Available task to run:\n';
      var taskList = '\n';
      if (Object.keys(this.tasks).length > 0) for (var task in this.tasks) {
        taskList += '     ' + task.green + ': ' + this.tasks[task].doc.cyan + '\n';
      }winston.info('' + header + taskList);
    }

    /**
      * populates instance tasks
      * @param files {Array} array of task objects to use when registering
    */

  }, {
    key: 'register',
    value: function register(files) {
      var _this4 = this;

      var registerTask = function registerTask(opts) {
        var ERR_MSG = 'Task missing properties...';
        var hasFunc = opts.func && typeof opts.func === 'function';
        var isDel = opts.concurrent || opts.sequence;
        if (opts.name && opts.doc && (hasFunc || isDel)) _this4.tasks[opts.name] = opts;else throw new Error(ERR_MSG);
      };
      if (files.length === 0) throw new Error('No tasks defined in bolt.tasks');
      this.tasks = {};
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = files[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var file = _step2.value;

          var taskOpts = require(process.cwd() + '/bolt.tasks/' + file);
          if (this.tasks[taskOpts.name]) throw new Error('Task ' + taskOpts.name + ' already defined...');
          if (Array.isArray(taskOpts)) taskOpts.map(registerTask);else registerTask(taskOpts);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }]);

  return BoltInstance;
}();

module.exports = BoltInstance;