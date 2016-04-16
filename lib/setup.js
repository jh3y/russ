'use strict';

require('colors');
var pkg = require('../package.json'),
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

var Con = winston.transports.Console;

var formatter = function formatter(o) {
  /**
    * Define the stamp color and print.
  */
  var stampColor = 'yellow';
  if (o.level === 'error' || o.level === 'success') stampColor = PROPS.LOGGER_CONFIG.COLORS[o.level];
  var stampMsg = pkg.name[stampColor];

  var dur = o.meta.durationMs;
  var msgColor = PROPS.LOGGER_CONFIG.COLORS[o.level];

  /**
    * Define message content. If a duration is available, we are profiling,
    * so prefix our message with "Finished".
  */
  var msg = dur ? ('Finished ' + o.message)[msgColor] : o.message[msgColor];

  var ms = void 0;
  var durColor = 'green';
  if (dur) {
    ms = dur / 1000;
    if (ms > 2) durColor = 'yellow';
    if (ms > 5) durColor = 'red';
  }
  var durMsg = dur ? 'in'.blue + ' ' + (ms.toString() + 's')[durColor] : '';
  var output = '[' + stampMsg + '] ' + msg + ' ' + durMsg;

  return output;
};

var setUpLogger = function setUpLogger() {
  winston.remove(Con);
  winston.add(Con, {
    level: 'silly',
    colorize: true,
    formatter: formatter
  });
  winston.setLevels(PROPS.LOGGER_CONFIG.LEVELS);
};

var setup = function setup() {
  setUpLogger();
};

module.exports = setup;