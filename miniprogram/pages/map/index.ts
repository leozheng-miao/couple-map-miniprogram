import type { Place, PlaceCategory, Space } from '../../types/domain';
import { callFunction, showError } from '../../utils/cloud';
import { toMarker, markerIdFromPlace } from '../../utils/map';

const categories = [
  { value: 'all', label: '全部' },
  { value: 'restaurant', label: '餐厅' },
  { value: 'hotel', label: '酒店' },
  { value: 'scenic', label: '景点' },
  { value: 'other', label: '其他' }
];

Page({
  data: {
    space: null as Space | null,
    places: [] as Place[],
    markers: [] as WechatMiniprogram.MapMarker[],
    selectedPlace: null as Place | null,
    categories,
    categoryIndex: 0,
    currentCategoryLabel: '全部',
    centerLatitude: 31.2304,
    centerLongitude: 121.4737
  },
  async onShow() {
    await this.loadPlaces();
  },
  async loadPlaces() {
    try {
      const { space } = await callFunction<{ space: Space | null }>('getCurrentSpace');
      if (!space) {
        wx.reLaunch({ url: '/pages/bootstrap/index' });
        return;
      }

      const category = categories[this.data.categoryIndex].value;
      const { places } = await callFunction<{ places: Place[] }>('listPlaces', {
        spaceId: space._id,
        category: category === 'all' ? '' : category
      });

      this.setData({
        space,
        places,
        markers: places.map(toMarker),
        selectedPlace: null,
        centerLatitude: places[0]?.latitude || this.data.centerLatitude,
        centerLongitude: places[0]?.longitude || this.data.centerLongitude
      });
    } catch (error) {
      showError(error);
    }
  },
  async onCategoryPick(event: WechatMiniprogram.PickerChange) {
    const categoryIndex = Number(event.detail.value);
    this.setData({
      categoryIndex,
      currentCategoryLabel: categories[categoryIndex].label
    });
    await this.loadPlaces();
  },
  onMarkerTap(event: WechatMiniprogram.MapMarkerTap) {
    const markerId = event.detail.markerId;
    const selectedPlace = this.data.places.find((place) => markerIdFromPlace(place) === markerId) || null;
    this.setData({ selectedPlace });
  },
  onMiniTap(event: WechatMiniprogram.TouchEvent) {
    const id = event.currentTarget.dataset.id as string;
    wx.navigateTo({ url: `/pages/place-detail/index?id=${id}` });
  },
  onTapPlace(event: WechatMiniprogram.CustomEvent) {
    const place = event.detail.place as Place;
    wx.navigateTo({ url: `/pages/place-detail/index?id=${place._id}` });
  },
  onAddPlace() {
    const spaceId = this.data.space?._id || '';
    wx.navigateTo({ url: `/pages/place-form/index?spaceId=${spaceId}` });
  }
});
