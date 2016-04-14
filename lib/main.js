'use strict';

/**
  * bolt - a lightweight task runner
  *
  * @author jh3y 2016
  * @license MIT
*/
var pkg = require('../package.json'),
    program = require('commander'),
    setup = require('./setup'),
    BoltInstance = require('./core/instance'),
    winston = require('winston');

var boltInstance = void 0;
var handle = function handle(opts) {
  if (opts.rawArgs.length === 2) boltInstance.info();
},
    handleCommand = function handleCommand(commands) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = commands[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var task = _step.value;

      try {
        var env = program.env;
        boltInstance.runTask(task, env);
      } catch (err) {
        winston.error(err.toString());
      }
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
},
    setUpInterface = function setUpInterface() {
  program.version(pkg.version).option('-e --env <value>', 'defines task runtime env').arguments('[command...]').action(handleCommand);
};

try {
  setup();
  setUpInterface();
  boltInstance = new BoltInstance();
  program.parse(process.argv);
  handle(program);
} catch (err) {
  winston.error(err.toString());
}