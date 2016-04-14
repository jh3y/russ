/**
  * bolt - a lightweight task runner
  *
  * @author jh3y 2016
  * @license MIT
*/
const pkg      = require('../package.json'),
  program      = require('commander'),
  setup        = require('./setup'),
  BoltInstance = require('./core/instance'),
  winston      = require('winston');

let boltInstance;
const handleCommand = (commands) => {
    for (const task of commands)
      try {
        boltInstance = new BoltInstance(program.env);
        boltInstance.runTask(task, program.env);
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
  boltInstance = new BoltInstance();
  if (program.rawArgs.length === 2) boltInstance.info();
} catch (err) {
  winston.error(err.toString());
}
