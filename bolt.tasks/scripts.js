module.exports = {
  name: 'compile:scripts',
  doc : 'compiles runtime JavaScript files',
  deps: [
    'bolt',
    'winston',
    'shelljs'
  ],
  func: function(b, w, s) {
    w.info('hello');
    b.info();
    b.runTask('compile:styles');
  }
};
