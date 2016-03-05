module.exports = {
  name: 'compile:styles',
  doc : 'compiles Stylus',
  deps: [
    'winston'
  ],
  func: function(winny) {
    winny.info('compiling away');
  }
};
