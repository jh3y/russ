require('colors');
const pkg = require('../package.json'),
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
};

const setup = () => {
  setUpLogger();
};

module.exports = setup;
