const cloud = require('wx-server-sdk');
const { ok, fail } = require('couple-map-cloud-common/response');
const { requireSpaceMember } = require('couple-map-cloud-common/auth');
const { requireString } = require('couple-map-cloud-common/validators');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  const db = cloud.database();
  const _ = db.command;
  const { OPENID } = cloud.getWXContext();

  try {
    const spaceId = requireString(event.spaceId, '空间ID');
    const { space } = await requireSpaceMember(OPENID, spaceId);
    const places = await db.collection('places').where({ spaceId, deletedAt: _.eq(null) }).get();
    const notes = await db.collection('notes').where({ spaceId, deletedAt: _.eq(null) }).get();

    return ok({
      space,
      places: places.data,
      notes: notes.data,
      exportedAt: new Date()
    });
  } catch (error) {
    return fail(error.message || '导出数据失败', 'EXPORT_DATA_FAILED');
  }
};
