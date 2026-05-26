const cloud = require('wx-server-sdk');
const { ok, fail } = require('couple-map-cloud-common/response');
const { requirePlaceAccess } = require('couple-map-cloud-common/auth');
const { requireString } = require('couple-map-cloud-common/validators');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  const db = cloud.database();
  const { OPENID } = cloud.getWXContext();

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
