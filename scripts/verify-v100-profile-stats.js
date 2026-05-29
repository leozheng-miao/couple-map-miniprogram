const assert = require('assert');
const Module = require('module');

const originalRequire = Module.prototype.require;
Module.prototype.require = function requireWithWxServerSdkMock(id) {
  if (id === 'wx-server-sdk') {
    return {
      init() {},
      DYNAMIC_CURRENT_ENV: 'test'
    };
  }
  return originalRequire.apply(this, arguments);
};

const { countActiveRecords } = require('../cloudfunctions/getCurrentSpace/index');

assert.strictEqual(
  countActiveRecords([
    { _id: 'a', deletedAt: null },
    { _id: 'b' },
    { _id: 'c', deletedAt: undefined },
    { _id: 'd', deletedAt: new Date() }
  ]),
  3
);
