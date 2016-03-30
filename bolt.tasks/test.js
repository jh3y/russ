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
      setTimeout(instance.resolve, 100);
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
      setTimeout(instance.resolve, 100);
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
      setTimeout(instance.resolve, 100);
    }
  }
];
