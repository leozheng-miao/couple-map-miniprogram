function getOpenId(event = {}) {
  const cloud = require('wx-server-sdk');
  const context = cloud.getWXContext ? cloud.getWXContext() : {};
  const openid = context.OPENID || context.openId || event.openid || event.openId || event.userInfo?.openId || event.userInfo?.OPENID;
  if (!openid) {
    throw new Error('无法获取微信用户身份，请确认云开发环境与小程序 AppID 已正确关联');
  }
  return openid;
}

module.exports = {
  getOpenId
};
