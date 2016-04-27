'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var winston = require('winston'),
    fs = require('fs'),
    BoltTask = require('./task');

var BoltInstance = function () {
  function BoltInstance(env) {
    _classCallCheck(this, BoltInstance);

    var runtime = '.boltrc';
    var path = process.cwd() + '/' + runtime;
    try {
      this.config = require(path);
    } catch (err) {
      throw Error('missing .boltrc file');
    }
    this.env = env;
    this.tasks = {};
    var tasks = fs.readdirSync('bolt.tasks');
    try {
      this.register(tasks);
    } catch (err) {
      winston.error(err.toString());
    }
  }

  _createClass(BoltInstance, [{
    key: 'run',
    value: function run(taskPool) {
      var _this = this;

      var tasks = taskPool[Symbol.iterator]();
      var exec = function exec(name, resolve, reject) {
        try {
          var task = new BoltTask(_this, _this.tasks[name]);
          task.run(_this.env).then(function () {
            winston.profile(name);
            if (tasks.next) {
              var nextTask = tasks.next();
              if (!nextTask.done) {
                exec(nextTask.value, resolve, reject);
              } else {
                resolve();
              }
            }
          }).catch(function (err) {
            winston.error('Error: ' + err);
            reject(err);
          });
        } catch (err) {
          winston.silly('Whoah whoah ' + err);
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
        if (task.sequence) tasks = task.sequence.filter(clean);else if (task.concurrent) tasks = task.concurrent.filter(clean);else tasks = [task.pre, task.post].filter(clean);

        if (parent) {
          var parentTask = _this2.tasks[parent];
          var pIdx = pool.indexOf(parent);
          var idx = name === parentTask.post ? pIdx + 1 : pIdx;
          pool.splice(idx, 0, name);
        } else if (!task.sequence) pool.push(name);

        var newParent = task.sequence ? undefined : name;
        if (tasks.length > 0) {
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

        if (task.sequence) winston.info('Running ' + task.name);
        // TODO Sort concurrent tasks.
        // if (task.concurrent && task.concurrent.length > 0) {
        //   for (const t of task.concurrent) this.runTask(t);
        // } else {
        winston.profile('SOMETHING');
        _this3.run(taskPool).then(function () {
          winston.profile('SOMETHING');
          winston.info('FII');
          resolve();
        });
        // }
      });
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
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = files[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var file = _step2.value;

          var taskOpts = require(process.cwd() + '/bolt.tasks/' + file);
          if (Array.isArray(taskOpts)) {
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
              for (var _iterator3 = taskOpts[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var _opt = _step3.value;

                this.tasks[_opt.name] = _opt;
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
          } else this.tasks[taskOpts.name] = taskOpts;
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