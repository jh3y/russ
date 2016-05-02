'use strict';
const expect   = require('chai').expect,
  sinon        = require('sinon'),
  fs           = require('fs'),
  winston      = require('winston'),
  BoltInstance = require('../lib/core/instance'),
  BoltTask     = require('../lib/core/task');

const PROPS = {
  NAME: 'bolt',
  CONFIG: '.boltrc',
  DIR: 'bolt.tasks'
};

const genTaskFile = (name, opts) => {
  const requirePath = `${process.cwd()}/${PROPS.DIR}/${name}`;
  if (require.cache[requirePath]) delete require.cache[requirePath];
  const funcMatch = /"(function)? *[ a-z ]*\({1}[ a-z, ]*\){1} *(=>)? *.*}"{1}/gmi;
  if (opts.func) opts.func = opts.func.toString().replace(new RegExp('\\n', 'g'), '');
  let content = `module.exports = ${JSON.stringify(opts)}`;
  const matches = content.match(funcMatch);
  if (matches && matches.length)
    for (const match of matches) {
      content = content.replace(match, match.substring(1, match.length - 1));
    }
  fs.writeFileSync(`${PROPS.DIR}/${name}`, content);
};


const cleanUp = function () {
  try {
    fs.accessSync(PROPS.CONFIG, fs.F_OK);
    fs.unlinkSync(PROPS.CONFIG);
    fs.accessSync(PROPS.DIR, fs.F_OK);
    const files = fs.readdirSync(PROPS.DIR);
    if (files.length !== 0)
      for (const file of files) fs.unlinkSync(`${PROPS.DIR}/${file}`);
    fs.rmdirSync(PROPS.DIR);
  } catch (err) {
    return;
  }
};

describe(PROPS.NAME, function() {
  describe('instance', function() {
    describe('initial setup', function () {
      afterEach(cleanUp);
      it('throws error when missing setup files', function() {
        const MISSING_MSG = `Missing ${PROPS.NAME} files...`;
        expect(() => new BoltInstance()).to.throw(Error, MISSING_MSG);
        fs.writeFileSync(PROPS.CONFIG, '{}');
        expect(() => new BoltInstance()).to.throw(Error, MISSING_MSG);
        fs.mkdirSync(PROPS.DIR);
        expect(() => new BoltInstance()).to.throw(Error);
      });
    });

    describe('task registry', function() {
      beforeEach(function() {
        fs.writeFileSync(PROPS.CONFIG, '{}');
        fs.mkdirSync(PROPS.DIR);
      });
      afterEach(cleanUp);

      it('empty tasks throw error', () => {
        const ERR_MSG = 'Task missing properties...';
        genTaskFile('task.js', {});
        expect(() => new BoltInstance()).to.throw(Error, ERR_MSG);
      });
      it('throws error where task missing props', () => {
        const ERR_MSG = 'Task missing properties...';
        const opts = {
          name: 'A',
          doc : 'A failing task'
        };
        genTaskFile('task.js', opts);
        expect(() => new BoltInstance()).to.throw(Error, ERR_MSG);
      });
      it('registers tasks', () => {
        const opts = {
          name: 'A',
          doc : 'A generic task',
          func: function(){}
        };
        genTaskFile('task.js', opts);
        const instance = new BoltInstance();
        expect(instance.tasks.A).to.not.be.undefined;
      });
      it('registers multiple tasks', () => {
        const optsA = {
          name: 'A',
          doc : 'A generic task',
          func: () => {}
        };
        const optsB = {
          name: 'B',
          doc : 'A generic task',
          func: () => {}
        };
        genTaskFile('A.js', optsA);
        genTaskFile('B.js', optsB);
        let myInstance = new BoltInstance();
        expect(Object.keys(myInstance.tasks).length).to.equals(2);
      });
      it('does not allow duplicates', () => {
        const ERR_MSG = 'Task A already defined...';
        const optsA = {
          name: 'A',
          doc : 'A generic task',
          func: () => {}
        };
        const optsB = {
          name: 'A',
          doc : 'A generic task',
          func: () => {}
        };
        genTaskFile('A.js', optsA);
        genTaskFile('B.js', optsB);
        expect(() => new BoltInstance()).to.throw(Error, ERR_MSG);
      });
    });
    describe('task pooling', () => {
      beforeEach(() => {
        fs.writeFileSync(PROPS.CONFIG, 'module.exports = {test: true}');
        fs.mkdirSync(PROPS.DIR);
      });
      afterEach(cleanUp);
      it('generates correct task pool', () => {
        const opts = {
          name: 'A',
          doc : 'First task',
          func: () => {}
        };
        genTaskFile('A.js', opts);
        const newInstance = new BoltInstance();
        const pool = newInstance.getPool('A');
        expect(pool.length).to.equals(1);
        expect(pool.toString()).to.equals('A');
      });
      it('does not duplicate tasks in the pool', () => {
        const opts = {
          name: 'A',
          doc : 'First task',
          func: function() {}
        };
        genTaskFile('A.js', opts);
        const optsB = {
          name: 'B',
          pre: 'A',
          post: 'A',
          doc: 'Greedy task',
          func: () => {}
        };
        genTaskFile('B.js', optsB);
        const newInstance = new BoltInstance();
        const pool = newInstance.getPool('B');
        expect(pool.length).to.equals(2);
        expect(pool.toString()).to.equals('A,B');
      });
      it('deeps searches to get all tasks for pool', () => {
        const opts = {
          name: 'A',
          doc: 'A',
          post: 'B',
          func: () => {}
        };
        genTaskFile('A.js', opts);
        opts.name = 'B';
        opts.pre  = 'A';
        opts.post = 'C';
        genTaskFile('B.js', opts);
        opts.name = 'C';
        opts.pre  = 'B';
        opts.post = 'D';
        genTaskFile('C.js', opts);
        opts.name = 'D';
        opts.pre  = 'C';
        opts.post = 'E';
        genTaskFile('D.js', opts);
        opts.name = 'E';
        opts.pre  = 'D';
        genTaskFile('E.js', opts);
        const newInstance = new BoltInstance();
        const expectedRes = 'A,B,C,D,E';
        let pool = newInstance.getPool('A');
        expect(pool.toString()).to.equal(expectedRes);
        pool = newInstance.getPool('C');
        expect(pool.toString()).to.equal(expectedRes);
        pool = newInstance.getPool('E');
        expect(pool.toString()).to.equal(expectedRes);
      });
      it('throws error when task is not defined', () => {
        const opts = {
          name: 'A',
          doc : 'Some task',
          post: 'B',
          func: () => {}
        };
        genTaskFile('A.js', opts);
        // Ensures we don't get a cached version that breaks our test.
        const newInstance = new BoltInstance();
        expect(() => newInstance.getPool('A')).to.throw(Error, 'Task B is not defined');
      })
    });
    describe('running tasks', () => {
      before(() => {
        winston.info = sinon.stub();
        winston.profile = sinon.stub();
        winston.error = sinon.stub();
        delete require.cache[`${process.cwd()}/.boltrc`];
      });
      beforeEach(() => {
        fs.writeFileSync(PROPS.CONFIG, 'module.exports = {test: true}');
        fs.mkdirSync(PROPS.DIR);
      });
      afterEach(cleanUp);
      it('runs task', (done) => {
        const opts = {
          name: 'A',
          doc : 'A dummy task',
          func: function(instance) {
            instance.__parent.env += this.name;
            instance.resolve();
          }
        };
        genTaskFile('task.js', opts);
        const newInstance = new BoltInstance('');
        newInstance.runTask('A').then(() => {
          expect(newInstance.env).to.equals('A');
          done();
        });
      });
      it('throws error if dep not installed', (done) => {
        const opts = {
          name: 'A',
          deps: [
            'fake-module'
          ],
          doc: 'Failing task',
          func: function () {}
        };
        genTaskFile('A.js', opts);
        const newInstance = new BoltInstance();
        const ERR_MSG = 'Error: Module fake-module not found, installed?';
        newInstance.runTask('A')
          .then(() => {
            // Will never run this...
          }, (err) => {
            expect(err).to.equals(ERR_MSG);
            done();
          });
      });
      it('honors rejection', (done) => {
        const opts = {
          name: 'A',
          doc : 'A dummy task',
          func: function(instance) {
            instance.reject('DONT WANT TO PLAY');
          }
        };
        genTaskFile('A.js', opts);
        const newInstance = new BoltInstance('');
        newInstance.runTask('A')
          .then(() => {
            // Will never run the success block...
          }, (err) => {
            expect(err).to.equals('DONT WANT TO PLAY');
            done();
          });
      });
      it('runs task defined in a sequence', (done) => {
        const opts = {
          name: 'A',
          doc : 'A sequence task',
          func: function(instance) {
            instance.__parent.env += this.name;
            instance.resolve();
          }
        };
        genTaskFile('A.js', opts);
        opts.name = 'B';
        genTaskFile('B.js', opts);
        genTaskFile('SEQUENCE.js', {
          name: 'SEQUENCE',
          doc : 'Run A followed by B',
          sequence: [
            'A',
            'B'
          ]
        });
        const newInstance =  new BoltInstance('');
        newInstance.runTask('SEQUENCE').then(() => {
          expect(newInstance.env).to.equal('AB');
          done();
        });
      });
      it('runs tasks concurrently', (done) => {
        const opts = {
          name: 'A',
          doc : 'A sequence task',
          func: function(instance) {
            instance.__parent[`${this.name}Started`] = new Date().getTime();
            setTimeout(instance.resolve, 250);
          }
        };
        genTaskFile('A.js', opts);
        opts.name = 'B';
        opts.func = function(instance) {
          instance.__parent[`${this.name}Started`] = new Date().getTime();
          instance.resolve();
        }
        genTaskFile('B.js', opts);
        genTaskFile('CONCURRENT.js', {
          name: 'CONCURRENT',
          doc : 'Run A and B',
          concurrent: [
            'A',
            'B'
          ]
        });
        const newInstance =  new BoltInstance('');
        newInstance.runTask('CONCURRENT').then(() => {
          const timeDiff = newInstance.BStarted - newInstance.AStarted;
          expect(timeDiff < 250).to.equal(true);
          done();
        });
      });
      it('runs pre/post hook tasks', (done) => {
        let opts = {
          name: 'A',
          doc : 'A dummy task',
          func: function(instance) {
            instance.__parent.env += this.name;
            instance.resolve();
          }
        };
        genTaskFile('task.js', opts);
        opts.name = 'C';
        genTaskFile('taskC.js', opts);
        opts.name = 'B';
        opts.pre  = 'A';
        opts.post = 'C';
        genTaskFile('taskB.js', opts);
        const myInstance = new BoltInstance('');
        myInstance.runTask('B').then(() => {
          expect(myInstance.env).to.equal('ABC');
          done();
        })
      });
      it('does not run a task more than once', (done) => {
        let opts = {
          name: 'A',
          doc : 'A dummy task',
          post: 'B',
          func: function(instance) {
            instance.__parent.env += this.name;
            instance.resolve();
          }
        };
        genTaskFile('A.js', opts);
        opts.name = 'B';
        opts.post = 'A';
        genTaskFile('B.js', opts);
        const myInstance = new BoltInstance('');
        myInstance.runTask('A').then(() => {
          expect(myInstance.env).to.equal('AB');
          done();
        })
      });
      it('is passed correct values', (done) => {
        const opts = {
          name: 'A',
          doc : 'A checker',
          deps: [
            'chai'
          ],
          func: function(chai, instance) {
            chai.expect(instance.resolve).to.not.be.undefined;
            chai.expect(instance.reject).to.not.be.undefined;
            chai.expect(instance.env).to.equal('TEST');
            chai.expect(instance.config).to.not.be.undefined;
            chai.expect(instance.config.test).to.equals(true);
            instance.resolve();
          }
        };
        genTaskFile('task.js', opts);
        const myInstance = new BoltInstance('TEST');
        myInstance.runTask('A').then(() => {
          done();
        });
      })
    });
  });
});

/**
  * TODO
  * 3. Correctly generates task pool(concurrent and sequential tasks)
  * 6. pre/post hook is covered by getPool testing sequenced pre/post?
*/
