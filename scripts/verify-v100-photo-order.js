const assert = require('assert');
const Module = require('module');

const originalRequire = Module.prototype.require;
Module.prototype.require = function requireWithWxServerSdkMock(id) {
  if (id === 'wx-server-sdk') {
    return {};
  }
  return originalRequire.apply(this, arguments);
};

const { orderPlacePhotoFileIds } = require('../cloudfunctions/common/media');

assert.deepStrictEqual(
  orderPlacePhotoFileIds({
    coverFileId: 'b',
    photoFileIds: ['a', 'b', 'c']
  }),
  ['b', 'a', 'c']
);

assert.deepStrictEqual(
  orderPlacePhotoFileIds({
    coverFileId: 'x',
    photoFileIds: ['a', 'b']
  }),
  ['a', 'b']
);

assert.deepStrictEqual(
  orderPlacePhotoFileIds({
    coverFileId: 'a',
    photoFileIds: ['a', 'a', 'b', '']
  }),
  ['a', 'b']
);
