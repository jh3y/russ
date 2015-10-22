(function() {
  // Look @ using process.argv and process.execArgv
  // console.log(this.process);
  var compile     = require('./compile'),
    showMessage = function() {
      console.log('I am running something yes?');
      compile();
    },
    run = function () {
      showMessage();
    };
  run();
}(this));
