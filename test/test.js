'use strict';

var expect   = require('chai').expect,
    fs       = require('fs'),
    instance = require('../lib/core/instance'),
    task     = require('../lib/core/task');

suite('bolt', function () {
  suite('instance', function () {
    afterEach(function() {
      fs.access('.boltrc', fs.F_OK, (err) => {
        if (!err) fs.unlink('.boltrc');
      });
      fs.access('bolt.tasks', fs.F_OK, (err) => {
        const files = fs.readdirSync('bolt.tasks');
        if (files.length !== 0)
          for (const file of files) fs.unlink(`bolt.tasks/${file}`);
        if (!err) fs.rmdirSync('bolt.tasks');
      });
    });
    test('throws error when missing setup files', function() {
      const MISSING_MSG = 'Missing bolt files...';
      expect(() => new instance()).to.throw(Error, MISSING_MSG);
      fs.writeFileSync('.boltrc', '{}');
      expect(() => new instance()).to.throw(Error, MISSING_MSG);
      fs.mkdirSync('bolt.tasks');
      expect(() => new instance()).to.throw(Error);
    });
    test('throws error when no task files created', () => {
      const ERR_MSG = 'No tasks defined in bolt.tasks';
      fs.writeFileSync('.boltrc', '{}');
      fs.mkdirSync('bolt.tasks');
      expect(() => new instance()).to.throw(Error, ERR_MSG);
      fs.writeFileSync('bolt.tasks/task.js', '{}');
      expect(() => new instance()).to.not.throw(Error);
    })
  });
});

/**
  * TODO
  * INSTANCE TESTING
  * 1. Generating new instance throws error when no .boltrc or bolt.tasks or
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
  * 2. Task run function, check that instance has the correct properties
  * 3. Constructor fails if certain properties don't exist.
  * 4. Check that run actually is invoked by instance?
*/
