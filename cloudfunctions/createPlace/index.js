const cloud = require('wx-server-sdk');
const { getOpenId } = require('./common/context');
const { ok, fail } = require('./common/response');
const { requireSpaceMember } = require('./common/auth');
const {
  normalizeStringArray,
  optionalString,
  requireCategory,
  requireNumber,
  requireString
} = require('./common/validators');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

function resolveCoverFileId(coverFileId, photoFileIds) {
  const normalizedCoverFileId = optionalString(coverFileId);
  if (normalizedCoverFileId && photoFileIds.includes(normalizedCoverFileId)) {
    return normalizedCoverFileId;
  }
  return photoFileIds[0] || '';
}

exports.main = async (event) => {
  const db = cloud.database();
  const OPENID = getOpenId(event);
  const now = new Date();

  try {
    const spaceId = requireString(event.spaceId, '空间ID');
    await requireSpaceMember(OPENID, spaceId);

    const photoFileIds = normalizeStringArray(event.photoFileIds);
    const coverFileId = resolveCoverFileId(event.coverFileId, photoFileIds);
    const place = {
      spaceId,
      name: requireString(event.name, '地点名称'),
      category: requireCategory(event.category),
      address: optionalString(event.address),
      latitude: requireNumber(event.latitude, '纬度'),
      longitude: requireNumber(event.longitude, '经度'),
      poiId: optionalString(event.poiId),
      visitDate: requireString(event.visitDate, '日期'),
      rating: Math.max(0, Math.min(5, Number(event.rating || 0))),
      content: optionalString(event.content),
      coverFileId,
      photoFileIds,
      checkinCount: 1,
      createdBy: OPENID,
      createdAt: now,
      updatedAt: now,
      deletedAt: null
    };

    const result = await db.collection('places').add({ data: place });
    return ok({ placeId: result._id });
  } catch (error) {
    return fail(error.message || '新增地点失败', 'CREATE_PLACE_FAILED');
  }
};
