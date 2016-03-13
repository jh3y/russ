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

let boltInstance;

const setUpLogger = () => {
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
  },
  handle = (opts) => {
    // When no options/commands are passed to bolt.
    if (opts.rawArgs.length === 2) boltInstance.info();
  },
  /**
    * Commands are RESERVED words. They can't be used as a task name.
    *
    * INFO, RUN, CREATE
  */
  handleCommand = (commands) => {
    // loop over commands and try to run them.
    for (const task of commands)
      try {
        boltInstance.runTask(task);
      } catch (err) {
        winston.error(err.toString());
      }
  },
  setUpInterface = () => {
      // bolt run --name yes please

      /**
        * What do I want it to do.
        *
        * bolt scripts:compile
        * bolt scripts:watch
      */
    program
      .version(pkg.version)
      .arguments('[command...]')
      .action(handleCommand);

  };

// Start the show...
try {
  setUpLogger();
  setUpInterface();
  boltInstance = new core.BoltInstance();
  program.parse(process.argv);
  handle(program);
} catch (err) {
  winston.error(err.toString());
}
