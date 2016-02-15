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
        .option('-m, --minified', 'Minify output')
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
    grabFiles = function(filesGlob, concatenated, callBack) {
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
    writeFile  = function(path, content) {
      var parentDir = path.substr(0, path.lastIndexOf('/'));
      if (!fs.existsSync(parentDir)){
        var dirs  = parentDir.split('/'),
          dirPath = '';
        while (dirs.length > 0) {
          var dir = dirs[0];
          if (dir.trim() !== '') {
            dirPath = dirPath + dir + '/';
            if (!fs.existsSync(dirPath)) {
              fs.mkdirSync(dirPath);
            }
          }
          dirs.shift();
        }
      }
      fs.writeFileSync(path, content);
    };
    utils = {
      getArgs    : getArgs,
      grabFiles  : grabFiles,
      concatFiles: concatFiles,
      writeFile  : writeFile
    };
  module.exports = utils;
}(this));
