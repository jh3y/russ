(function(){
  var fs    = require('fs'),
    getArgs = function(args) {
      var opts = {};
      args = args.slice(2);
      while(args.length > 0) {
        var opt = args.shift();
        if (opt.indexOf('--') !== -1 || opt.indexOf('-') !== -1) {
          opt = opt.replace(new RegExp('-', 'g'), '');
          if (args[0].indexOf('--') === -1 || args[0].indexOf('-') === -1) {
            opts[opt] = args.shift();
          } else {
            opts[opt] = true;
          }
        } else {
          opts.input = opt;
        }
      }
      return opts;
    },
    readFiles = function(filePaths, callBack) {
      var files = {},
        errors  = {};
      filePaths.forEach(function(filePath, idx) {
        fs.readFile(filePath, 'utf-8', function(err, fileData){
          if (err) {
            errors[filePath] = err;
          } else {
            files[filePath]  = fileData;
          }
          if (idx + 1 === filePaths.length) {
            callBack(errors, files);
          }
        });
      });
    },
    concatFiles = function(files) {
      var result = '';
      for (var file in files) {
        result += files[file];
      }
      return result;
    },
    utils = {
      getArgs    : getArgs,
      readFiles  : readFiles,
      concatFiles: concatFiles
    };
  module.exports = utils;
}(this));
