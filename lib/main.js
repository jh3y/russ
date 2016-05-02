'use strict';

/**
  * AbY - just another task runner
  *
  * @author jh3y 2016
  * @license MIT
*/
var pkg = require('../package.json'),
    program = require('commander'),
    setup = require('./setup'),
    winston = require('winston'),
    AbyInstance = require('./core/instance');

var abyInstance = void 0;

var handleCommand = function handleCommand(commands) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = commands[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var task = _step.value;

      try {
        abyInstance = new AbyInstance(program.env);
        abyInstance.runTask(task);
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
    setupInterface = function setupInterface() {
  program.version(pkg.version).option('-e --env <value>', 'defines task/s runtime env').arguments('[command...]').action(handleCommand);
};

try {
  setup();
  setupInterface();
  program.parse(process.argv);
  /* Unless handleCommmand is invoked we create an instance and show info */
  abyInstance = new AbyInstance();
  if (program.rawArgs.length === 2) abyInstance.info();
} catch (err) {
  winston.error(err.toString());
}