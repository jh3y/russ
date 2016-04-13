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
      level: 'silly',
      colorize : true,
      formatter: function(opts) {
        const stampColor = (opts.level === 'error' || opts.level === 'success') ? PROPS.LOGGER_CONFIG.COLORS[opts.level]: 'yellow';
        const dur = opts.meta.durationMs;
        const stamp = pkg.name[stampColor];
        const color = PROPS.LOGGER_CONFIG.COLORS[opts.level];
        const msg = (dur) ? `Finished ${opts.message}`[color]: opts.message[color];
        let durColor;
        if (dur) {
          durColor = 'green';
          if ((dur / 1000) > 2) durColor = 'yellow';
          if ((dur / 1000) > 5) durColor = 'red';
        }
        const durMsg = (dur) ? `${'in'.blue} ${(dur / 1000).toString()[durColor] + 's'.blue}` : '';
        const output = `[${stamp}] ${msg} ${durMsg}`;
        return output;
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
