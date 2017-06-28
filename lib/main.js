'use strict';

require('babel-polyfill');
/**
  * russ - node scripts runner
  *
  * @author jh3y 2016
  * @license MIT
*/
var pkg = require('../package.json'),
    program = require('commander'),
    setup = require('./setup'),
    winston = require('winston'),
    RussInstance = require('./core/instance');

var instance = void 0;

var handleCommand = function handleCommand(commands) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = commands[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var task = _step.value;

      try {
        instance = new RussInstance(program.env);
        instance.runTask(task);
      } catch (err) {
        winston.error(err.toString() + '\n' + err.stack);
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
  instance = new RussInstance();
  if (program.rawArgs.length === 2) instance.info();
} catch (err) {
  winston.error(err.toString() + '\n' + err.stack);
}