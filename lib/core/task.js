'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var winston = require('winston');

var BoltTask = function () {
  function BoltTask(parent, opts) {
    _classCallCheck(this, BoltTask);

    Object.assign(this, opts);
    this.parent = parent;
    if (opts.deps.length > 0) {
      this.deps = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = opts.deps[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var dep = _step.value;

          this.deps.push(require(dep));
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
  }

  _createClass(BoltTask, [{
    key: 'run',
    value: function run(env) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        winston.info('Running ' + _this.name);
        winston.profile(_this.name);
        if (_this.func && typeof _this.func === 'function') _this.func.apply(_this, _toConsumableArray(_this.deps).concat([{
          env: env,
          config: _this.parent.config,
          resolve: resolve,
          reject: reject,
          run: _this.parent.runTask.bind(_this.parent)
        }]));
      });
    }
  }]);

  return BoltTask;
}();

module.exports = BoltTask;