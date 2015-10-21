(function() {
  var compile     = require('./compile'),
    showMessage = function() {
      console.log('I am running something yes?');
      compile();
    },
    run = function () {
      showMessage();
    };
  run();
}());
