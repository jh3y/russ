'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require('colors');
var winston = require('winston'),
    fs = require('fs');

var BoltInstance = function () {
  function BoltInstance() {
    _classCallCheck(this, BoltInstance);

    /**
      * When creating an instance, we want to register tasks
      * gathered from "bolt.tasks" directory.
    */
    try {
      var runtime = '.boltrc';
      var path = process.cwd() + '/' + runtime;
      this.config = require(path);
    } catch (err) {
      throw Error('missing .boltrc file');
    }

    this.tasks = {};
    var tasks = fs.readdirSync('bolt.tasks');
    try {
      this.registerTasks(tasks);
    } catch (err) {
      winston.error(err.toString());
    }
  }

  _createClass(BoltInstance, [{
    key: 'runTask',
    value: function runTask(name, env) {
      var _this = this;

      var run = function run(name) {
        if (_this.tasks[name]) _this.tasks[name].run(env).then(function () {
          winston.info('finished ' + name);
          if (tasks.next) {
            var nextTask = tasks.next();
            if (!nextTask.done) run(nextTask.value);
          }
        }).catch(function (err) {
          winston.error('Error: ' + err);
        });else throw Error('Whoah no such task!');
      };

      var task = this.tasks[name];
      var tasks = [task.pre, name, task.post];
      var clean = function clean(a) {
        return a;
      };
      tasks = tasks.filter(clean);
      if (tasks.length > 1) tasks = tasks[Symbol.iterator]();
      // Iterate through tasks
      run(tasks.next ? tasks.next().value : tasks[0]);
    }
  }, {
    key: 'info',
    value: function info() {
      var taskList = '\n';
      if (Object.keys(this.tasks).length > 0) for (var task in this.tasks) {
        taskList += '     ' + task.green + ': ' + this.tasks[task].doc.cyan + '\n';
      }var header = 'Available task to run:\n';
      winston.info('' + header + taskList);
    }
  }, {
    key: 'registerTasks',
    value: function registerTasks(files) {
      if (files.length === 0) throw new Error('No tasks in ./bolt.tasks/');
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = files[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var file = _step.value;

          var taskOpts = require(process.cwd() + '/bolt.tasks/' + file);
          if (Array.isArray(taskOpts)) {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = taskOpts[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var opt = _step2.value;

                this.tasks[opt.name] = new BoltTask(this, opt);
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
          } else this.tasks[taskOpts.name] = new BoltTask(this, taskOpts);
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
  }]);

  return BoltInstance;
}();

var defaults = {
  name: 'compile:scripts',
  doc: 'compiles runtime JavaScript files',
  deps: ['winston'],
  func: function func(w) {
    w.info('hello');
  }
};

// name, doc, func, pre, post

var BoltTask = function () {
  function BoltTask(parent) {
    var opts = arguments.length <= 1 || arguments[1] === undefined ? defaults : arguments[1];

    _classCallCheck(this, BoltTask);

    Object.assign(this, opts);
    this.parent = parent;
    if (opts.deps.length > 0) {
      this.deps = [];
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = opts.deps[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var dep = _step3.value;

          if (dep !== 'bolt') this.deps.push(require(dep));else this.deps.push(parent);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }
  }

  _createClass(BoltTask, [{
    key: 'info',
    value: function info() {
      winston.info(this.name + ': ' + this.doc);
    }
  }, {
    key: 'run',
    value: function run(env) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        winston.info('Running ' + _this2.name);
        if (_this2.func && typeof _this2.func === 'function') _this2.func.apply(_this2, _toConsumableArray(_this2.deps).concat([{
          env: env,
          config: _this2.parent.config,
          resolve: resolve,
          reject: reject
        }]));
      });
    }
  }]);

  return BoltTask;
}();

exports.BoltInstance = BoltInstance;
exports.BoltTask = BoltTask;