var pkg  = require('./package.json'),
  env    = 'public/',
  src    = 'src/',
  config = {
    name      : pkg.name,
    pluginOpts: {
      coffee     : {},
      browsersync: {
        name: 'boltServer',
        server: 'public/',
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
      },
      uglify: {
        output: {
          comments: true
        },
        fromString: true
      }
    },
    paths     : {
      sources: {
        styles   : src + 'stylus/{style,*}.stylus',
        scripts  : src + 'coffee/**/{greet,*}.coffee',
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
