const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

function ok(data = {}) {
  return { success: true, data };
}

function fail(message, code = 'BAD_REQUEST', details = null) {
  return { success: false, error: { code, message, details } };
}

function getOpenId(event = {}) {
  const context = cloud.getWXContext ? cloud.getWXContext() : {};
  const openid = context.OPENID || context.openId || event.openid || event.openId || event.userInfo?.openId || event.userInfo?.OPENID;
  if (!openid) {
    throw new Error('无法获取微信用户身份，请确认云开发环境与小程序 AppID 已正确关联');
  }
  return openid;
}

function optionalString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function requireDisplayName(value, field) {
  const normalized = optionalString(value);
  if (!normalized) {
    throw new Error(`${field}不能为空`);
  }
  if (normalized.length > 24) {
    throw new Error(`${field}不能超过24个字`);
  }
  return normalized;
}

exports.main = async (event) => {
  const db = cloud.database();
  const OPENID = getOpenId(event);
  const now = new Date();

  try {
    const userResult = await db.collection('users').where({ _openid: OPENID }).limit(1).get();
    const user = userResult.data[0];
    if (!user) {
      throw new Error('请先登录');
    }
    if (!user.currentSpaceId) {
      throw new Error('请先创建或加入空间');
    }

    const spaceResult = await db.collection('spaces').doc(user.currentSpaceId).get();
    const space = spaceResult.data;
    if (!space || !Array.isArray(space.memberOpenids) || !space.memberOpenids.includes(OPENID)) {
      throw new Error('无权访问当前情侣空间');
    }

    const nickName = requireDisplayName(event.nickName || user.nickName || '我', '我的名字');
    const avatarUrl = optionalString(event.avatarUrl || user.avatarUrl);
    const spaceName = requireDisplayName(event.spaceName || space.name || '我们的情侣地图', '空间名称');

    await Promise.all([
      db.collection('users').doc(user._id).update({
        data: {
          nickName,
          avatarUrl,
          updatedAt: now
        }
      }),
      db.collection('spaces').doc(space._id).update({
        data: {
          name: spaceName,
          updatedAt: now
        }
      })
    ]);

    return ok({
      user: {
        ...user,
        nickName,
        avatarUrl,
        updatedAt: now
      },
      space: {
        ...space,
        name: spaceName,
        updatedAt: now
      }
    });
  } catch (error) {
    return fail(error.message || '更新资料失败', 'UPDATE_PROFILE_FAILED');
  }
};
