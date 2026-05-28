const cloud = require('wx-server-sdk');
const { getOpenId } = require('./common/context');
const { ok, fail } = require('./common/response');
const { requirePlaceAccess } = require('./common/auth');
const { requireString } = require('./common/validators');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  const db = cloud.database();
  const OPENID = getOpenId(event);

  try {
    const placeId = requireString(event.placeId, '地点ID');
    await requirePlaceAccess(OPENID, placeId);

    await db.collection('places').doc(placeId).update({
      data: { deletedAt: new Date(), updatedAt: new Date() }
    });

    return ok({ placeId });
  } catch (error) {
    return fail(error.message || '删除地点失败', 'DELETE_PLACE_FAILED');
  }
};
