(function(){
  var fs    = require('fs'),
    program = require('commander'),
    glob    = require('glob'),
    File    = require('vinyl'),
    async   = require('async'),
    getArgs = function(args) {
      program
        .option('-d, --dir [value]', 'Specify a directory')
        .option('-e, --exec [value]', 'Execute function')
        .option('-c, --compiler [value]', 'Node script to fire')
        .option('-n, --name [value]', 'Name')
        .option('-m, --minified', 'Minify output')
        .parse(args);
      return program;
    },
    concatenate = function(files) {
      var bufferList = [];
      for (var file in files) {
        bufferList.push(files[file].contents);
      }
      return Buffer.concat(bufferList);
    },
    get = function(filesGlob, callBack) {
      glob(filesGlob, {nosort: true}, function(err, files){
        var readFiles = [];
        var readFile  = function (filePath, cb) {
          fs.readFile(filePath, function(error, data) {
            var globFile = new File({
              path: filePath,
              contents: data
            });
            readFiles.push(globFile);
            cb();
          });
        };
        async.map(files, readFile, function() {
          callBack(readFiles);
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
      get        : get,
      concatenate: concatenate,
      writeFile  : writeFile
    };
  module.exports = utils;
}(this));
