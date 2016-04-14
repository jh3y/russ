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

var setUpLogger = function setUpLogger() {
  winston.remove(winston.transports.Console);
  winston.add(winston.transports.Console, {
    level: 'silly',
    colorize: true,
    formatter: function formatter(opts) {
      var stampColor = opts.level === 'error' || opts.level === 'success' ? PROPS.LOGGER_CONFIG.COLORS[opts.level] : 'yellow';
      var dur = opts.meta.durationMs;
      var stamp = pkg.name[stampColor];
      var color = PROPS.LOGGER_CONFIG.COLORS[opts.level];
      var msg = dur ? ('Finished ' + opts.message)[color] : opts.message[color];
      var durColor = void 0;
      if (dur) {
        durColor = 'green';
        if (dur / 1000 > 2) durColor = 'yellow';
        if (dur / 1000 > 5) durColor = 'red';
      }
      var durMsg = dur ? 'in'.blue + ' ' + ((dur / 1000).toString()[durColor] + 's'.blue) : '';
      var output = '[' + stamp + '] ' + msg + ' ' + durMsg;
      return output;
    }
  });
  winston.setLevels(PROPS.LOGGER_CONFIG.LEVELS);
};

var setup = function setup() {
  setUpLogger();
};

module.exports = setup;