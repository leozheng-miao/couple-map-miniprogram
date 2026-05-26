const cloud = require('wx-server-sdk');
const { ok, fail } = require('couple-map-cloud-common/response');
const { requireUser } = require('couple-map-cloud-common/auth');
const { optionalString } = require('couple-map-cloud-common/validators');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

function createInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

exports.main = async (event) => {
  const db = cloud.database();
  const { OPENID } = cloud.getWXContext();
  const now = new Date();

  try {
    const user = await requireUser(OPENID);
    if (user.currentSpaceId) {
      throw new Error('你已经加入情侣空间');
    }

    const name = optionalString(event.name) || '我们的情侣地图';
    const inviteCode = createInviteCode();
    const inviteExpireAt = new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000);

    const addResult = await db.collection('spaces').add({
      data: {
        name,
        ownerOpenid: OPENID,
        memberOpenids: [OPENID],
        inviteCode,
        inviteExpireAt,
        createdAt: now,
        updatedAt: now
      }
    });

    await db.collection('users').doc(user._id).update({
      data: {
        currentSpaceId: addResult._id,
        updatedAt: now
      }
    });

    return ok({ spaceId: addResult._id, inviteCode, inviteExpireAt });
  } catch (error) {
    return fail(error.message || '创建空间失败', 'CREATE_SPACE_FAILED');
  }
};
