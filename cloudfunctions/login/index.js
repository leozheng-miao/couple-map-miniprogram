const cloud = require('wx-server-sdk');
const { ok, fail } = require('./common/response');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  const db = cloud.database();
  const { OPENID } = cloud.getWXContext();
  const now = new Date();

  try {
    const nickName = typeof event.nickName === 'string' ? event.nickName : '';
    const avatarUrl = typeof event.avatarUrl === 'string' ? event.avatarUrl : '';
    const existing = await db.collection('users').where({ _openid: OPENID }).limit(1).get();

    if (existing.data.length === 0) {
      const user = {
        _openid: OPENID,
        nickName,
        avatarUrl,
        currentSpaceId: '',
        createdAt: now,
        updatedAt: now
      };
      const addResult = await db.collection('users').add({ data: user });
      return ok({ user: { ...user, _id: addResult._id } });
    }

    const user = existing.data[0];
    const updatedUser = {
      ...user,
      nickName: nickName || user.nickName || '',
      avatarUrl: avatarUrl || user.avatarUrl || '',
      updatedAt: now
    };

    await db.collection('users').doc(user._id).update({
      data: {
        nickName: updatedUser.nickName,
        avatarUrl: updatedUser.avatarUrl,
        updatedAt: now
      }
    });

    return ok({ user: updatedUser });
  } catch (error) {
    return fail(error.message || '登录失败', 'LOGIN_FAILED');
  }
};
