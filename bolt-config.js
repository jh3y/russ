var pkg  = require('./package.json'),
  env    = 'public/',
  src    = 'src/',
  config = {
    name      : pkg.name,
    pluginOpts: {
      coffee  : {},
      cssnano : {
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
      jade    : {
        data  : {
          name       : pkg.name,
          description: pkg.description
        }
      }
    },
    paths     : {
      sources: {
        styles   : src + 'stylus/{style,*}.stylus',
        scripts  : src + 'coffee/**/*.coffee',
        markup   : src + 'jade/*.jade',
        overwatch: env + '**/*.*'
      },
      destinations: {
        styles : env + 'css/',
        scripts: env + 'js/',
        markup : env
      }
    }
  };
module.exports = config;
