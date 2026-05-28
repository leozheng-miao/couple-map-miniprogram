const cloud = require('wx-server-sdk');
const { ok, fail } = require('./common/response');
const { requirePlaceAccess } = require('./common/auth');
const { optionalString, requireNoteColor, requireString } = require('./common/validators');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  const db = cloud.database();
  const { OPENID } = cloud.getWXContext();
  const now = new Date();

  try {
    const placeId = requireString(event.placeId, '地点ID');
    const { place } = await requirePlaceAccess(OPENID, placeId);
    const text = optionalString(event.text);
    const photoFileId = optionalString(event.photoFileId);
    if (!text && !photoFileId) {
      throw new Error('便利贴需要文字或照片');
    }

    const note = {
      spaceId: place.spaceId,
      placeId,
      text,
      color: requireNoteColor(event.color || 'yellow'),
      photoFileId,
      createdBy: OPENID,
      createdAt: now,
      updatedAt: now,
      deletedAt: null
    };

    const result = await db.collection('notes').add({ data: note });
    return ok({ noteId: result._id });
  } catch (error) {
    return fail(error.message || '新增便利贴失败', 'CREATE_NOTE_FAILED');
  }
};
