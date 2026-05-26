import { CLOUD_ENV_ID } from './env';

App<IAppOption>({
  globalData: {
    currentSpaceId: '',
    user: null
  },
  onLaunch() {
    if (!wx.cloud) {
      wx.showModal({
        title: '基础库版本过低',
        content: '请使用 2.2.3 或以上的基础库以支持云开发。',
        showCancel: false
      });
      return;
    }

    wx.cloud.init({
      env: CLOUD_ENV_ID || undefined,
      traceUser: true
    });
  }
});
