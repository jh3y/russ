module.exports = [
  {
    name: 'A',
    doc: 'task a',
    post: 'B',
    deps: [
      'winston'
    ],
    func: (w, instance) => {
      setTimeout(instance.resolve, 2000);
    }
  },
  {
    name: 'B',
    doc: 'task b',
    pre: 'A',
    post: 'C',
    deps: [
      'winston'
    ],
    func: (w, instance) => {
      setTimeout(instance.resolve, 10000);
    }
  },
  {
    name: 'C',
    doc: 'task c',
    pre: 'B',
    post: 'D',
    deps: [
      'winston'
    ],
    func: (w, instance) => {
      setTimeout(instance.resolve, 3000);
    }
  },
  {
    name: 'D',
    doc: 'task d',
    pre: 'C',
    deps: [
      'winston'
    ],
    func: (w, instance) => {
      setTimeout(instance.resolve, 1000);
    }
  },
  {
    name: 'E',
    doc: 'runs compile:scripts followed by compile:styles',
    sequence: [
      'compile:scripts',
      'compile:styles'
    ]
  },
  {
    name: 'F',
    doc: 'runs watch:scripts and watch:styles simultaneously',
    concurrent: [
      'watch:scripts',
      'watch:styles'
    ]
  }
];
