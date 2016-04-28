'use strict';

var assert = require('assert'),
    boltCore = require('../lib/core');

suite('bolt', function () {
  suite('run', function () {
    test('is', function () {
      assert(boltCore.boltInstance).is.not.undefined;
    });
  });
});