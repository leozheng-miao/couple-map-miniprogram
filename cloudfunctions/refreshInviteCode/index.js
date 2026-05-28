const cloud = require('wx-server-sdk');
const { ok, fail } = require('./common/response');
const { requireSpaceMember } = require('./common/auth');
const { requireString } = require('./common/validators');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

function createInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

exports.main = async (event) => {
  const db = cloud.database();
  const { OPENID } = cloud.getWXContext();
  const now = new Date();

  try {
    const spaceId = requireString(event.spaceId, '空间ID');
    const { space } = await requireSpaceMember(OPENID, spaceId);

    if (space.ownerOpenid !== OPENID) {
      throw new Error('只有创建者可以刷新邀请码');
    }

    const inviteCode = createInviteCode();
    const inviteExpireAt = new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000);

    await db.collection('spaces').doc(spaceId).update({
      data: { inviteCode, inviteExpireAt, updatedAt: now }
    });

    return ok({ inviteCode, inviteExpireAt });
  } catch (error) {
    return fail(error.message || '刷新邀请码失败', 'REFRESH_INVITE_FAILED');
  }
};
