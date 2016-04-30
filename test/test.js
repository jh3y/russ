'use strict';

const expect   = require('chai').expect,
  fs           = require('fs'),
  BoltInstance = require('../lib/core/instance'),
  BoltTask     = require('../lib/core/task');

const PROPS = {
  NAME: 'bolt',
  CONFIG: '.boltrc',
  DIR: 'bolt.tasks'
};

const clearOutRequireCache = () => {
  for (const entry in require.cache)
    if (entry.indexOf(PROPS.DIR) !== -1) delete require.cache[entry];
};

const genTaskFile = (name, opts) => {
  const content = `module.exports = ${JSON.stringify(opts)}`;
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
    describe('setup', function () {
      afterEach(cleanUp);
      it('throws error when missing setup files', function() {
        const MISSING_MSG = `Missing ${PROPS.NAME} files...`;
        expect(() => new BoltInstance()).to.throw(Error, MISSING_MSG);
        fs.writeFileSync(PROPS.CONFIG, '{}');
        expect(() => new BoltInstance()).to.throw(Error, MISSING_MSG);
        fs.mkdirSync(PROPS.DIR);
        expect(() => new BoltInstance()).to.throw(Error);
      });
      it('throws error when no task files created', function() {
        const ERR_MSG = `No tasks defined in ${PROPS.DIR}`;
        fs.writeFileSync(PROPS.CONFIG, '{}');
        fs.mkdirSync(PROPS.DIR);
        expect(() => new BoltInstance()).to.throw(Error, ERR_MSG);
        fs.writeFileSync(`${PROPS.DIR}/task.js`, '{}');
        expect(() => new BoltInstance()).to.not.throw(Error);
      });
    });

    describe('registry', function() {
      beforeEach(function() {
        fs.writeFileSync(PROPS.CONFIG, '{}');
        fs.mkdirSync(PROPS.DIR);
        clearOutRequireCache();
      });
      afterEach(cleanUp);

      it('empty tasks dont register', () => {
        genTaskFile('task.js', {});
        const newInstance = new BoltInstance();
        expect(Object.keys(newInstance.tasks).length).to.equals(0);
      });
      it('registers tasks', () => {
        const opts = {
          name: 'A',
          doc: 'A generic task'
        };
        genTaskFile('task.js', opts);
        let instance = new BoltInstance();
        expect(instance.tasks.A).to.not.be.undefined;
      });
      it('registers multiple tasks', () => {
        const optsA = {
          name: 'A',
          doc: 'A generic task'
        };
        const optsB = {
          name: 'B',
          doc : 'A generic task'
        };
        genTaskFile('A.js', optsA);
        genTaskFile('B.js', optsB);
        let myInstance = new BoltInstance();
        expect(Object.keys(myInstance.tasks).length).to.equals(2);
      });
    });
  });
});

/**
  * TODO
  * INSTANCE TESTING
  * 1. Generating new BoltInstance throws error when no .boltrc or bolt.tasks or
  * no tasks in bolt.tasks folder
  * 2. Correctly registers tasks
  * 3. Correctly generates task pool(concurrent and sequential tasks)
  * 4. Potentially test the info function to check output
  * 5. Task gen should fail where a task has no name, func, or description
  * 6. pre/post hook is covered by getPool testing
  * 7. But can we test if I run 'B', 'A' and 'C' are also run(and in order???)
  * 8. Testing of the actual "run" task will be tricky
  * TASK Testing
  * 1. Test that a task is correctly generated with the correct content?
  * 2. Task run function, check that BoltInstance has the correct properties
  * 3. Constructor fails if certain properties don't exist.
  * 4. Check that run actually is invoked by BoltInstance?
*/
