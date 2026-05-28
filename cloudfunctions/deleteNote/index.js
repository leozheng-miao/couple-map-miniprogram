const cloud = require('wx-server-sdk');
const { ok, fail } = require('./common/response');
const { requireSpaceMember } = require('./common/auth');
const { requireString } = require('./common/validators');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  const db = cloud.database();
  const { OPENID } = cloud.getWXContext();

  try {
    const noteId = requireString(event.noteId, '便利贴ID');
    const noteResult = await db.collection('notes').doc(noteId).get();
    const note = noteResult.data;
    if (!note || note.deletedAt) {
      throw new Error('便利贴不存在或已删除');
    }
    await requireSpaceMember(OPENID, note.spaceId);

    await db.collection('notes').doc(noteId).update({
      data: { deletedAt: new Date(), updatedAt: new Date() }
    });

    return ok({ noteId });
  } catch (error) {
    return fail(error.message || '删除便利贴失败', 'DELETE_NOTE_FAILED');
  }
};
