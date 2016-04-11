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
      this.register(tasks);
    } catch (err) {
      winston.error(err.toString());
    }
  }

  _createClass(BoltInstance, [{
    key: 'runTask',
    value: function runTask(name) {
      var _this = this;

      var clean = function clean(a) {
        return a && tasksToRun.indexOf(a) === -1;
      };
      var task = this.tasks[name];
      var tasksToRun = [];
      // Need to do some recursion here on the first in the list...
      var getList = function getList(name, parent) {
        if (name) {
          if (!parent) tasksToRun.push(name);else {
            var parentTask = _this.tasks[parent];
            var pIdx = tasksToRun.indexOf(parent);
            var idx = name === parentTask.post ? pIdx + 1 : pIdx;
            tasksToRun.splice(idx, 0, name);
          }
          // Calculate pre/post
          var _task = _this.tasks[name];
          var _tasks = [_task.pre, _task.post].filter(clean);
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = _tasks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var t = _step.value;
              getList(t, name);
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
      if (task.sequence && task.sequence.length > 0) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = task.sequence[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _t = _step2.value;
            getList(_t);
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
      } else getList(name);

      var run = function run(name) {
        try {
          var _task2 = new BoltTask(_this, _this.tasks[name]);
          _task2.run().then(function () {
            winston.info('Finished ' + name);
            if (tasks.next) {
              var nextTask = tasks.next();
              if (!nextTask.done) run(nextTask.value);
            }
          }).catch(function (err) {
            winston.error('Error: ' + err);
          });
        } catch (err) {
          winston.silly('Whoah whoah ' + err);
        }
      };
      var tasks = tasksToRun[Symbol.iterator]();

      if (task.concurrent && task.concurrent.length > 0) {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = task.concurrent[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var _t2 = _step3.value;
            run(_t2);
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
      } else run(tasks.next ? tasks.next().value : tasks[0]);
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
    key: 'register',
    value: function register(files) {
      if (files.length === 0) throw new Error('No tasks in ./bolt.tasks/');
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = files[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var file = _step4.value;

          var taskOpts = require(process.cwd() + '/bolt.tasks/' + file);
          if (Array.isArray(taskOpts)) {
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
              for (var _iterator5 = taskOpts[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                var _opt = _step5.value;

                this.tasks[_opt.name] = _opt;
              }
            } catch (err) {
              _didIteratorError5 = true;
              _iteratorError5 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion5 && _iterator5.return) {
                  _iterator5.return();
                }
              } finally {
                if (_didIteratorError5) {
                  throw _iteratorError5;
                }
              }
            }
          } else this.tasks[taskOpts.name] = taskOpts;
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }
    }
  }]);

  return BoltInstance;
}();

// const defaults = {
//   name: 'compile:scripts',
//   doc : 'compiles runtime JavaScript files',
//   deps: [
//     'winston'
//   ],
//   func: function(w) {
//     w.info('hello');
//   }
// };

// name, doc, func, pre, post


var BoltTask = function () {
  function BoltTask(parent, opts) {
    _classCallCheck(this, BoltTask);

    Object.assign(this, opts);
    this.parent = parent;
    if (opts.deps.length > 0) {
      this.deps = [];
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = opts.deps[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var dep = _step6.value;

          this.deps.push(require(dep));
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }
    }
  }

  _createClass(BoltTask, [{
    key: 'run',
    value: function run(env) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        winston.info('Running ' + _this2.name);
        if (_this2.func && typeof _this2.func === 'function') _this2.func.apply(_this2, _toConsumableArray(_this2.deps).concat([{
          env: env,
          config: _this2.parent.config,
          resolve: resolve,
          reject: reject,
          run: _this2.parent.runTask.bind(_this2.parent)
        }]));
      });
    }
  }]);

  return BoltTask;
}();

exports.BoltInstance = BoltInstance;
exports.BoltTask = BoltTask;