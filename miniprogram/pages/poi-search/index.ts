import { TENCENT_MAP_KEY } from '../../env';
import type { PoiItem, PlaceCategory } from '../../types/domain';
import { callFunction, showError } from '../../utils/cloud';
import { categoryLabels } from '../../utils/format';

interface PoiView extends PoiItem {
  categoryLabel: string;
  distanceText: string;
}

Page({
  data: {
    keyword: '',
    latitude: 31.2304,
    longitude: 121.4737,
    hasMapKey: Boolean(TENCENT_MAP_KEY),
    pois: [] as PoiView[]
  },
  onLoad(query: Record<string, string>) {
    this.setData({
      latitude: Number(query.latitude) || 31.2304,
      longitude: Number(query.longitude) || 121.4737
    });
  },
  onKeywordInput(event: WechatMiniprogram.Input) {
    this.setData({ keyword: event.detail.value });
  },
  async onSearch() {
    if (!this.data.keyword.trim()) {
      wx.showToast({ title: '请输入地点名称', icon: 'none' });
      return;
    }
    if (!TENCENT_MAP_KEY) {
      this.setData({ hasMapKey: false });
      return;
    }

    try {
      const { pois } = await callFunction<{ pois: PoiItem[] }>('searchPoi', {
        keyword: this.data.keyword.trim(),
        latitude: this.data.latitude,
        longitude: this.data.longitude,
        mapKey: TENCENT_MAP_KEY
      });
      this.setData({
        pois: pois.map((poi) => ({
          ...poi,
          categoryLabel: categoryLabels[(poi.category || 'other') as PlaceCategory],
          distanceText: poi.distance ? `${Math.round(poi.distance)}m` : ''
        }))
      });
    } catch (error) {
      showError(error);
    }
  },
  onSelectPoi(event: WechatMiniprogram.TouchEvent) {
    const index = Number(event.currentTarget.dataset.index);
    const poi = this.data.pois[index];
    const channel = this.getOpenerEventChannel();
    channel.emit('selectedPoi', poi);
    wx.navigateBack();
  },
  onManualPick() {
    wx.redirectTo({
      url: `/pages/map-picker/index?latitude=${this.data.latitude}&longitude=${this.data.longitude}`
    });
  }
});
