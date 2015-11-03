(function(){
  var fs    = require('fs'),
    program = require('commander'),
    glob    = require('glob'),
    async   = require('async'),
    getArgs = function(args) {
      program
        .option('-d, --dir [value]', 'Specify a directory')
        .option('-e, --exec [value]', 'Execute function')
        .option('-n, --name [value]', 'Name')
        .parse(args);
      return program;
    },
    concatFiles = function(files, paths) {
      var result = '';
      for (var path in paths) {
        result += files[paths[path]];
      }
      return result;
    },
    readFiles = function(filesGlob, concatenated, callBack) {
      glob(filesGlob, {nosort: true}, function(err, files){
        var result    = {};
        var readFile = function (filePath, cb) {
          fs.readFile(filePath, 'utf-8', function(error, data) {
            result[filePath] = data;
            cb();
          });
        };
        async.map(files, readFile, function(err, results) {
          if (concatenated) {
            result = concatFiles(result, files);
          }
          callBack(result);
        });
      });
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
