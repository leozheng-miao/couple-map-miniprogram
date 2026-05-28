const cloud = require('wx-server-sdk');
const { ok, fail } = require('./common/response');
const { requireUser } = require('./common/auth');
const { requireString } = require('./common/validators');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  const db = cloud.database();
  const _ = db.command;
  const { OPENID } = cloud.getWXContext();
  const now = new Date();

  try {
    const user = await requireUser(OPENID);
    const inviteCode = requireString(event.inviteCode, '邀请码').toUpperCase();
    const result = await db.collection('spaces').where({ inviteCode }).limit(1).get();
    const space = result.data[0];

    if (!space) {
      throw new Error('邀请码无效');
    }
    if (new Date(space.inviteExpireAt).getTime() < Date.now()) {
      throw new Error('邀请码已过期');
    }
    if (space.memberOpenids.length >= 2 && !space.memberOpenids.includes(OPENID)) {
      throw new Error('这个情侣空间已经满员');
    }

    if (!space.memberOpenids.includes(OPENID)) {
      await db.collection('spaces').doc(space._id).update({
        data: {
          memberOpenids: _.addToSet(OPENID),
          updatedAt: now
        }
      });
    }

    await db.collection('users').doc(user._id).update({
      data: {
        currentSpaceId: space._id,
        updatedAt: now
      }
    });

    return ok({ spaceId: space._id });
  } catch (error) {
    return fail(error.message || '加入空间失败', 'JOIN_SPACE_FAILED');
  }
};
