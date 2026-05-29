import type { AppUser, Note, Place, Space } from '../../types/domain';
import { callFunction, showError } from '../../utils/cloud';
import { chooseAndUploadImages } from '../../utils/file';

interface SpaceStats {
  placesCount: number;
  notesCount: number;
}

Page({
  data: {
    user: {} as AppUser,
    space: {} as Space,
    profileForm: {
      nickName: '',
      avatarUrl: '',
      spaceName: ''
    },
    memberCount: 0,
    canInvite: false,
    placesCount: 0,
    notesCount: 0,
    savingProfile: false,
    uploadingAvatar: false
  },
  async onShow() {
    await this.loadProfile();
  },
  async loadProfile() {
    try {
      const { user, space, stats } = await callFunction<{ user: AppUser; space: Space | null; stats?: SpaceStats }>('getCurrentSpace');
      if (!space) {
        wx.reLaunch({ url: '/pages/bootstrap/index' });
        return;
      }
      const memberCount = Array.isArray(space.memberOpenids) ? space.memberOpenids.length : 0;
      const profileStats = stats || await this.loadProfileStats(space._id);
      this.setData({
        user,
        space,
        profileForm: {
          nickName: user.nickName || '',
          avatarUrl: user.avatarUrl || '',
          spaceName: space.name || ''
        },
        memberCount,
        canInvite: memberCount < 2,
        placesCount: profileStats.placesCount,
        notesCount: profileStats.notesCount
      });
    } catch (error) {
      showError(error);
    }
  },
  async loadProfileStats(spaceId: string): Promise<SpaceStats> {
    try {
      const { places } = await callFunction<{ places: Place[] }>('listPlaces', { spaceId });
      const details = await Promise.all(
        places.map((place) => callFunction<{ notes: Note[] }>('getPlaceDetail', { placeId: place._id }))
      );
      return {
        placesCount: places.length,
        notesCount: details.reduce((total, detail) => total + (Array.isArray(detail.notes) ? detail.notes.length : 0), 0)
      };
    } catch (error) {
      return {
        placesCount: 0,
        notesCount: 0
      };
    }
  },
  onProfileInput(event: WechatMiniprogram.Input) {
    const field = event.currentTarget.dataset.field as string;
    this.setData({ [`profileForm.${field}`]: event.detail.value });
  },
  async onChooseAvatar() {
    if (!this.data.space._id || this.data.uploadingAvatar) return;
    this.setData({ uploadingAvatar: true });
    try {
      const [avatarUrl] = await chooseAndUploadImages(this.data.space._id, 1, 'avatars');
      if (avatarUrl) {
        this.setData({ 'profileForm.avatarUrl': avatarUrl });
        await this.saveProfile({ silent: true });
      }
    } catch (error) {
      showError(error);
    } finally {
      this.setData({ uploadingAvatar: false });
    }
  },
  async onSaveProfile() {
    await this.saveProfile();
  },
  async saveProfile(options: { silent?: boolean } = {}) {
    const form = this.data.profileForm;
    if (!form.nickName.trim() || !form.spaceName.trim()) {
      wx.showToast({ title: '请填写名字和空间名', icon: 'none' });
      return;
    }
    this.setData({ savingProfile: true });
    try {
      const { user, space } = await callFunction<{ user: AppUser; space: Space }>('updateProfile', {
        nickName: form.nickName,
        avatarUrl: form.avatarUrl,
        spaceName: form.spaceName
      });
      const nextSpace = space;
      const memberCount = Array.isArray(nextSpace.memberOpenids) ? nextSpace.memberOpenids.length : 0;
      this.setData({
        user,
        space: nextSpace,
        memberCount,
        canInvite: memberCount < 2,
        profileForm: {
          nickName: user.nickName || '',
          avatarUrl: user.avatarUrl || '',
          spaceName: nextSpace.name || ''
        }
      });
      if (!options.silent) {
        wx.showToast({ title: '已保存', icon: 'success' });
      }
    } catch (error) {
      showError(error);
    } finally {
      this.setData({ savingProfile: false });
    }
  },
  onCopyInvite() {
    if (!this.data.canInvite) return;
    const inviteCode = this.data.space.inviteCode;
    if (!inviteCode) return;
    wx.setClipboardData({ data: inviteCode });
  },
  async onRefreshInvite() {
    if (!this.data.canInvite) return;
    try {
      const result = await callFunction<{ inviteCode: string; inviteExpireAt: string }>('refreshInviteCode', {
        spaceId: this.data.space._id
      });
      this.setData({ space: Object.assign({}, this.data.space, result) });
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
