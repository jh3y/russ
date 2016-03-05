/**
  * bolt - a lightweight task runner
  *
  * @author jh3y 2016
  * @license MIT
*/
require('colors');
const pkg = require('../package.json'),
  program = require('commander'),
  core    = require('./core'),
  winston = require('winston');

const PROPS       = {
  LOGGER_CONFIG: {
    LEVELS: {
      info   : 1,
      warn   : 2,
      error  : 3,
      success: 4,
      silly  : 5
    },
    COLORS: {
      info   : 'blue',
      warn   : 'yellow',
      error  : 'red',
      success: 'green',
      silly  : 'rainbow'
    }
  }
};

program
  .version(pkg.version);

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
  level    : 'silly',
  colorize : true,
  formatter: function(options) {
    const color = PROPS.LOGGER_CONFIG.COLORS[options.level];
    return `[${pkg.name.yellow}] ${options.message[color]}`;
  }
});
winston.setLevels(PROPS.LOGGER_CONFIG.LEVELS);

program.parse(process.argv);

try {
  const boltInstance = new core.BoltInstance();
  boltInstance.runTask('compile:scripts');
} catch (err) {
  winston.error(err.toString());
}
