require('babel-polyfill');
/**
  * russ - node scripts runner
  *
  * @author jh3y 2016
  * @license MIT
*/
const pkg      = require('../package.json'),
  program      = require('commander'),
  setup        = require('./setup'),
  winston      = require('winston'),
  RussInstance = require('./core/instance');

let instance;

const handleCommand = (commands) => {
    for (const task of commands)
      try {
        instance = new RussInstance(program.env);
        instance.runTask(task);
      } catch (err) {
        winston.error(err.toString());
      }
  },
  setupInterface = () => {
    program
      .version(pkg.version)
      .option('-e --env <value>', 'defines task/s runtime env')
      .arguments('[command...]')
      .action(handleCommand);
  };

try {
  setup();
  setupInterface();
  program.parse(process.argv);
  /* Unless handleCommmand is invoked we create an instance and show info */
  instance = new RussInstance();
  if (program.rawArgs.length === 2) instance.info();
} catch (err) {
  winston.error(err.toString());
}
