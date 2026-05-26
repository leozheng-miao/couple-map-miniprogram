import type { Note, Place } from '../../types/domain';
import { callFunction, showError } from '../../utils/cloud';
import { categoryLabels, formatRating } from '../../utils/format';

Page({
  data: {
    id: '',
    place: { photoFileIds: [] } as Place,
    notes: [] as Note[],
    categoryLabel: '',
    ratingText: ''
  },
  async onLoad(query: Record<string, string>) {
    this.setData({ id: query.id });
  },
  async onShow() {
    if (this.data.id) await this.loadDetail();
  },
  async loadDetail() {
    try {
      const { place, notes } = await callFunction<{ place: Place; notes: Note[] }>('getPlaceDetail', {
        placeId: this.data.id
      });
      this.setData({
        place,
        notes,
        categoryLabel: categoryLabels[place.category],
        ratingText: formatRating(place.rating)
      });
    } catch (error) {
      showError(error);
    }
  },
  onEdit() {
    wx.navigateTo({ url: `/pages/place-form/index?id=${this.data.id}` });
  },
  onAddNote() {
    wx.navigateTo({ url: `/pages/note-form/index?placeId=${this.data.id}` });
  },
  onTapNote(event: WechatMiniprogram.CustomEvent) {
    const note = event.detail.note as Note;
    wx.navigateTo({ url: `/pages/note-form/index?placeId=${this.data.id}&noteId=${note._id}` });
  },
  onDelete() {
    wx.showModal({
      title: '删除地点',
      content: '删除后地图和列表不再显示，但照片文件不会立即清理。',
      confirmColor: '#E94B43',
      success: async (result) => {
        if (!result.confirm) return;
        try {
          await callFunction('deletePlace', { placeId: this.data.id });
          wx.switchTab({ url: '/pages/map/index' });
        } catch (error) {
          showError(error);
        }
      }
    });
  }
});
