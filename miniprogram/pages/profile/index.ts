import type { AppUser, Space } from '../../types/domain';
import { callFunction, showError } from '../../utils/cloud';

Page({
  data: {
    user: {} as AppUser,
    space: {} as Space,
    memberCount: 0,
    placesCount: 0,
    notesCount: 0
  },
  async onShow() {
    await this.loadProfile();
  },
  async loadProfile() {
    try {
      const { user, space } = await callFunction<{ user: AppUser; space: Space | null }>('getCurrentSpace');
      if (!space) {
        wx.reLaunch({ url: '/pages/bootstrap/index' });
        return;
      }
      const { places } = await callFunction<{ places: unknown[] }>('listPlaces', { spaceId: space._id });
      this.setData({
        user,
        space,
        memberCount: space.memberOpenids.length,
        placesCount: places.length
      });
    } catch (error) {
      showError(error);
    }
  },
  onCopyInvite() {
    const inviteCode = this.data.space.inviteCode;
    if (!inviteCode) return;
    wx.setClipboardData({ data: inviteCode });
  },
  async onRefreshInvite() {
    try {
      const result = await callFunction<{ inviteCode: string; inviteExpireAt: string }>('refreshInviteCode', {
        spaceId: this.data.space._id
      });
      this.setData({ space: { ...this.data.space, ...result } });
      wx.showToast({ title: '已刷新', icon: 'success' });
    } catch (error) {
      showError(error);
    }
  },
  async onExport() {
    try {
      const data = await callFunction('exportData', { spaceId: this.data.space._id });
      wx.setClipboardData({ data: JSON.stringify(data, null, 2) });
      wx.showToast({ title: '已复制导出数据', icon: 'success' });
    } catch (error) {
      showError(error);
    }
  }
});
