'use strict';

/**
  * bolt - a lightweight task runner
  *
  * @author jh3y 2016
  * @license MIT
*/
require('colors');
var pkg = require('../package.json'),
    program = require('commander'),
    core = require('./core'),
    winston = require('winston');

var PROPS = {
  LOGGER_CONFIG: {
    LEVELS: {
      info: 1,
      warn: 2,
      error: 3,
      success: 4,
      silly: 5
    },
    COLORS: {
      info: 'blue',
      warn: 'yellow',
      error: 'red',
      success: 'green',
      silly: 'rainbow'
    }
  }
};

var boltInstance = void 0;

var setUpLogger = function setUpLogger() {
  winston.remove(winston.transports.Console);
  winston.add(winston.transports.Console, {
    colorize: true,
    formatter: function formatter(opts) {
      var dur = opts.meta.durationMs;
      var stamp = pkg.name.yellow;
      var color = PROPS.LOGGER_CONFIG.COLORS[opts.level];
      var msg = dur ? ('Finished ' + opts.message)[color] : opts.message[color];
      var durMsg = dur ? 'in ' + dur / 1000 + 's' : '';
      var output = '[' + stamp + '] ' + msg + ' ' + durMsg;
      return output;
    }
  });
  winston.setLevels(PROPS.LOGGER_CONFIG.LEVELS);
},
    handle = function handle(opts) {
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
  setUpLogger();
  setUpInterface();
  boltInstance = new core.BoltInstance();
  program.parse(process.argv);
  handle(program);
} catch (err) {
  winston.error(err.toString());
}