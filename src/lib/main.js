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
    if (opts.rawArgs.length === 2) boltInstance.info();
  },
  handleCommand = (commands) => {
    for (const task of commands)
      try {
        const env = program.env;
        boltInstance.runTask(task, env);
      } catch (err) {
        winston.error(err.toString());
      }
  },
  setUpInterface = () => {
    program
      .version(pkg.version)
      .option('-e --env <value>', 'defines task runtime env')
      .arguments('[command...]')
      .action(handleCommand);

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
