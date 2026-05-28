const cloud = require('wx-server-sdk');
const { getOpenId } = require('./common/context');
const { ok, fail } = require('./common/response');
const { requirePlaceAccess } = require('./common/auth');
const {
  normalizeStringArray,
  optionalString,
  requireCategory,
  requireNumber,
  requireString
} = require('./common/validators');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  const db = cloud.database();
  const OPENID = getOpenId(event);

  try {
    const placeId = requireString(event.placeId, '地点ID');
    await requirePlaceAccess(OPENID, placeId);

    const photoFileIds = normalizeStringArray(event.photoFileIds);
    const data = {
      name: requireString(event.name, '地点名称'),
      category: requireCategory(event.category),
      address: optionalString(event.address),
      latitude: requireNumber(event.latitude, '纬度'),
      longitude: requireNumber(event.longitude, '经度'),
      poiId: optionalString(event.poiId),
      visitDate: requireString(event.visitDate, '日期'),
      rating: Math.max(0, Math.min(5, Number(event.rating || 0))),
      content: optionalString(event.content),
      coverFileId: optionalString(event.coverFileId) || photoFileIds[0] || '',
      photoFileIds,
      updatedAt: new Date()
    };

    await db.collection('places').doc(placeId).update({ data });
    return ok({ placeId });
  } catch (error) {
    return fail(error.message || '更新地点失败', 'UPDATE_PLACE_FAILED');
  }
};
