module.exports = [{
  name: 'compile',
  doc : 'compiles scripts and styles',
  concurrent: [
    'compile:styles',
    'compile:scripts'
  ]
}];
