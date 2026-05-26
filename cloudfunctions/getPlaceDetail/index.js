const cloud = require('wx-server-sdk');
const { ok, fail } = require('couple-map-cloud-common/response');
const { requirePlaceAccess } = require('couple-map-cloud-common/auth');
const { requireString } = require('couple-map-cloud-common/validators');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  const db = cloud.database();
  const _ = db.command;
  const { OPENID } = cloud.getWXContext();

  try {
    const placeId = requireString(event.placeId, '地点ID');
    const { place } = await requirePlaceAccess(OPENID, placeId);
    const notesResult = await db.collection('notes')
      .where({ placeId, deletedAt: _.eq(null) })
      .orderBy('createdAt', 'desc')
      .get();

    return ok({ place, notes: notesResult.data });
  } catch (error) {
    return fail(error.message || '获取地点详情失败', 'GET_PLACE_DETAIL_FAILED');
  }
};
