/**
  * AbY - just another task runner
  *
  * @author jh3y 2016
  * @license MIT
*/
const pkg      = require('../package.json'),
  program      = require('commander'),
  setup        = require('./setup'),
  winston      = require('winston'),
  AbyInstance = require('./core/instance');

let abyInstance;

const handleCommand = (commands) => {
    for (const task of commands)
      try {
        abyInstance = new AbyInstance(program.env);
        abyInstance.runTask(task);
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
  abyInstance = new AbyInstance();
  if (program.rawArgs.length === 2) abyInstance.info();
} catch (err) {
  winston.error(err.toString());
}
