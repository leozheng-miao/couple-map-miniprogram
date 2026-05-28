const cloud = require('wx-server-sdk');
const { getOpenId } = require('./common/context');
const { ok, fail } = require('./common/response');
const { requireSpaceMember } = require('./common/auth');
const { optionalString, requireCategory, requireString } = require('./common/validators');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  const db = cloud.database();
  const _ = db.command;
  const OPENID = getOpenId(event);

  try {
    const spaceId = requireString(event.spaceId, '空间ID');
    const category = optionalString(event.category);
    await requireSpaceMember(OPENID, spaceId);

    const where = { spaceId, deletedAt: _.eq(null) };
    if (category) {
      where.category = requireCategory(category);
    }

    const result = await db.collection('places').where(where).orderBy('visitDate', 'desc').get();
    return ok({ places: result.data });
  } catch (error) {
    return fail(error.message || '获取地点失败', 'LIST_PLACES_FAILED');
  }
};
