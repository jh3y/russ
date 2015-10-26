(function(){
  var fs    = require('fs'),
    utils = {
      readFiles: function(filePaths, callBack) {
        var files = {},
          errors  = {};
        filePaths.forEach(function(filePath, idx) {
          console.log(filePath, idx);
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
      concatFiles: function(files) {
        var result = '';
        for (var file in files) {
          result += files[file];
        }
        return result;
      }
    };
  module.exports = utils;
}(this));
