import type { AlbumPhoto, Space } from '../../types/domain';
import { callFunction, showError } from '../../utils/cloud';

const categories = [
  { value: 'all', label: '全部相册' },
  { value: 'restaurant', label: '餐厅' },
  { value: 'hotel', label: '酒店' },
  { value: 'scenic', label: '景点' },
  { value: 'entertainment', label: '娱乐' },
  { value: 'special', label: '特殊' },
  { value: 'other', label: '其他' }
];

Page({
  data: {
    spaceId: '',
    photos: [] as AlbumPhoto[],
    categories,
    categoryIndex: 0,
    currentCategoryLabel: '全部相册'
  },
  async onShow() {
    await this.loadPhotos();
  },
  async loadPhotos() {
    try {
      const { space } = await callFunction<{ space: Space | null }>('getCurrentSpace');
      if (!space) {
        wx.reLaunch({ url: '/pages/bootstrap/index' });
        return;
      }
      const category = categories[this.data.categoryIndex].value;
      const { photos } = await callFunction<{ photos: AlbumPhoto[] }>('getAlbum', {
        spaceId: space._id,
        category: category === 'all' ? '' : category
      });
      this.setData({ spaceId: space._id, photos });
    } catch (error) {
      showError(error);
    }
  },
  async onCategoryPick(event: WechatMiniprogram.PickerChange) {
    const categoryIndex = Number(event.detail.value);
    this.setData({ categoryIndex, currentCategoryLabel: categories[categoryIndex].label });
    await this.loadPhotos();
  },
  onTapPhoto(event: WechatMiniprogram.TouchEvent) {
    const placeId = event.currentTarget.dataset.placeId as string;
    wx.navigateTo({ url: `/pages/place-detail/index?id=${placeId}` });
  }
});
