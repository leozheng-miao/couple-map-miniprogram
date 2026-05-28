const cloud = require('wx-server-sdk');

function getDb() {
  return cloud.database();
}

async function getUser(openid) {
  const db = getDb();
  const result = await db.collection('users').where({ _openid: openid }).limit(1).get();
  return result.data[0] || null;
}

async function requireUser(openid) {
  const user = await getUser(openid);
  if (!user) {
    throw new Error('请先登录');
  }
  return user;
}

async function requireSpaceMember(openid, spaceId) {
  const db = getDb();
  const user = await requireUser(openid);
  const result = await db.collection('spaces').doc(spaceId).get();
  const space = result.data;

  if (!space || !Array.isArray(space.memberOpenids) || !space.memberOpenids.includes(openid)) {
    throw new Error('无权访问当前情侣空间');
  }

  return { user, space };
}

async function requirePlaceAccess(openid, placeId) {
  const db = getDb();
  const placeResult = await db.collection('places').doc(placeId).get();
  const place = placeResult.data;
  if (!place || place.deletedAt) {
    throw new Error('地点不存在或已删除');
  }
  const { user, space } = await requireSpaceMember(openid, place.spaceId);
  return { user, space, place };
}

module.exports = {
  getDb,
  getUser,
  requireUser,
  requireSpaceMember,
  requirePlaceAccess
};
