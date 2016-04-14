/**
  * bolt - a lightweight task runner
  *
  * @author jh3y 2016
  * @license MIT
*/
const pkg = require('../package.json'),
  program = require('commander'),
  setup = require('./setup'),
  BoltInstance = require('./core/instance'),
  winston = require('winston');

let boltInstance;
const handle = (opts) => {
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
  setup();
  setUpInterface();
  boltInstance = new BoltInstance();
  program.parse(process.argv);
  handle(program);
} catch (err) {
  winston.error(err.toString());
}
