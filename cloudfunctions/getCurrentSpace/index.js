const cloud = require('wx-server-sdk');
const { ok, fail } = require('./common/response');
const { getUser, requireSpaceMember } = require('./common/auth');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async () => {
  const { OPENID } = cloud.getWXContext();

  try {
    const user = await getUser(OPENID);
    if (!user || !user.currentSpaceId) {
      return ok({ user, space: null });
    }

    const { space } = await requireSpaceMember(OPENID, user.currentSpaceId);
    return ok({ user, space });
  } catch (error) {
    return fail(error.message || '获取空间失败', 'GET_SPACE_FAILED');
  }
};
