const assert = require('assert'),
  boltCore = require('../lib/core');

suite('bolt', () => {
  suite('run', () => {
    test('is', ()=> {
      assert(boltCore.boltInstance).is.not.undefined;
    })
  })
})
