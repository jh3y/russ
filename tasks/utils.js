(function(){
  var fs    = require('fs'),
    program = require('commander'),
    async   = require('async'),
    getArgs = function(args) {
      program
        .option('-d, --dir [value]', 'Specify a directory')
        .option('-e, --exec [value]', 'Execute function')
        .option('-n, --name [value]', 'Name')
        .parse(args);
      return program;
    },
    readFiles = function(filePaths, callBack) {
      var files    = {};
      var readFile = function (filePath, cb) {
        fs.readFile(filePath, 'utf-8', function(error, data) {
          files[filePath] = data;
          cb();
        });
      };
      async.map(filePaths, readFile, function(err, results) {
        callBack(files);
      });
    },
    concatFiles = function(files, paths) {
      var result = '';
      for (var path in paths) {
        result += files[paths[path]];
      }
      return result;
    },
    license = function(file, cb) {
      var content;
      var license = fs.readFileSync('./LICENSE.md', 'utf-8');
      content = '/*\n' + license + '*/\n' + file;
      return content;
    };
    utils = {
      getArgs    : getArgs,
      readFiles  : readFiles,
      concatFiles: concatFiles,
      license    : license
    };
  module.exports = utils;
}(this));
