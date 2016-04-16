require('colors');
const pkg = require('../package.json'),
  winston = require('winston');

const PROPS = {
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

const Con = winston.transports.Console;

const formatter = (o) => {
  /**
    * Define the stamp color and print.
  */
  let stampColor = 'yellow';
  if (o.level === 'error' || o.level === 'success')
    stampColor = PROPS.LOGGER_CONFIG.COLORS[o.level];
  const stampMsg = pkg.name[stampColor];

  const dur = o.meta.durationMs;
  const msgColor = PROPS.LOGGER_CONFIG.COLORS[o.level];

  /**
    * Define message content. If a duration is available, we are profiling,
    * so prefix our message with "Finished".
  */
  const msg = (dur) ? `Finished ${o.message}`[msgColor] : o.message[msgColor];

  let ms;
  let durColor = 'green';
  if (dur) {
    ms = dur / 1000;
    if (ms > 2) durColor = 'yellow';
    if (ms > 5) durColor = 'red';
  }
  const durMsg = (dur) ? `${'in'.blue} ${(ms.toString() + 's')[durColor]}` : '';
  const output = `[${stampMsg}] ${msg} ${durMsg}`;

  return output;
};

const setUpLogger = () => {
  winston.remove(Con);
  winston.add(Con, {
    level    : 'silly',
    colorize : true,
    formatter: formatter
  });
  winston.setLevels(PROPS.LOGGER_CONFIG.LEVELS);
};

const setup = () => {
  setUpLogger();
};

module.exports = setup;
