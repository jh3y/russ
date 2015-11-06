var pkg  = require('./package.json'),
  env    = 'public/',
  src    = 'src/',
  config = {
    name      : pkg.name,
    pluginOpts: {
      coffee     : {},
      browsersync: {
        server: 'public/',
        files : 'public/',
        port  : 1987
      },
      cssnano    : {
        core: false,
        discardComments: {
          removeAllButFirst: true
        },
        autoprefixer: {
          browsers: [
            'last 3 versions'
          ],
          add: true
        }
      },
      jade       : {
        data : {
          name       : pkg.name,
          description: pkg.description
        }
      }
    },
    paths     : {
      sources: {
        styles   : src + 'stylus/{style,*}.stylus',
        scripts  : src + 'coffee/**/*.coffee',
        markup   : src + 'jade/*.jade'
      },
      destinations: {
        styles : env + 'css/',
        scripts: env + 'js/',
        markup : env
      }
    }
  };
module.exports = config;
