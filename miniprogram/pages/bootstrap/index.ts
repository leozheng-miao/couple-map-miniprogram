import { callFunction, showError } from '../../utils/cloud';

Page({
  data: {
    loading: true,
    showJoin: false,
    inviteCode: ''
  },
  async onLoad() {
    await this.bootstrap();
  },
  async bootstrap() {
    try {
      await callFunction('login');
      const { space } = await callFunction<{ space: unknown }>('getCurrentSpace');
      if (space) {
        wx.switchTab({ url: '/pages/map/index' });
        return;
      }
    } catch (error) {
      showError(error);
    } finally {
      this.setData({ loading: false });
    }
  },
  toggleJoin() {
    this.setData({ showJoin: !this.data.showJoin });
  },
  onInviteInput(event: WechatMiniprogram.Input) {
    this.setData({ inviteCode: event.detail.value.toUpperCase() });
  },
  async onCreateSpace() {
    this.setData({ loading: true });
    try {
      await callFunction('createSpace', { name: '我们的情侣地图' });
      wx.switchTab({ url: '/pages/map/index' });
    } catch (error) {
      showError(error);
    } finally {
      this.setData({ loading: false });
    }
  },
  async onJoinSpace() {
    if (!this.data.inviteCode.trim()) {
      wx.showToast({ title: '请输入邀请码', icon: 'none' });
      return;
    }
    this.setData({ loading: true });
    try {
      await callFunction('joinSpace', { inviteCode: this.data.inviteCode.trim() });
      wx.switchTab({ url: '/pages/map/index' });
    } catch (error) {
      showError(error);
    } finally {
      this.setData({ loading: false });
    }
  }
});
