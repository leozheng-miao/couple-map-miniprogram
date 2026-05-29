const cloud = require('wx-server-sdk');
const { getOpenId } = require('./common/context');
const { ok, fail } = require('./common/response');
const { getUser, requireSpaceMember } = require('./common/auth');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

function countActiveRecords(records) {
  return records.filter((record) => !record.deletedAt).length;
}

exports.main = async (event) => {
  const db = cloud.database();
  const OPENID = getOpenId(event);

  try {
    const user = await getUser(OPENID);
    if (!user || !user.currentSpaceId) {
      return ok({ user, space: null, stats: { placesCount: 0, notesCount: 0 } });
    }

    const { space } = await requireSpaceMember(OPENID, user.currentSpaceId);
    const [placesResult, notesResult] = await Promise.all([
      db.collection('places').where({ spaceId: space._id }).get(),
      db.collection('notes').where({ spaceId: space._id }).get()
    ]);

    return ok({
      user,
      space,
      stats: {
        placesCount: countActiveRecords(placesResult.data || []),
        notesCount: countActiveRecords(notesResult.data || [])
      }
    });
  } catch (error) {
    return fail(error.message || '获取空间失败', 'GET_SPACE_FAILED');
  }
};

module.exports = {
  main: exports.main,
  countActiveRecords
};
