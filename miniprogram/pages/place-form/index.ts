import type { Place, PlaceCategory, Space } from '../../types/domain';
import { callFunction, showError } from '../../utils/cloud';
import { today } from '../../utils/date';
import { chooseAndUploadImages } from '../../utils/file';
import { formatRating } from '../../utils/format';

const categories = [
  { value: 'restaurant', label: '餐厅' },
  { value: 'hotel', label: '酒店' },
  { value: 'scenic', label: '景点' },
  { value: 'other', label: '其他' }
];

function emptyForm(spaceId = '') {
  return {
    placeId: '',
    spaceId,
    name: '',
    category: 'restaurant' as PlaceCategory,
    address: '',
    latitude: 0,
    longitude: 0,
    poiId: '',
    visitDate: today(),
    rating: 5,
    content: '',
    coverFileId: '',
    photoFileIds: [] as string[],
    photoUrls: [] as string[]
  };
}

Page({
  data: {
    categories,
    form: emptyForm(),
    saving: false,
    ratingText: formatRating(5)
  },
  async onLoad(query: Record<string, string>) {
    const spaceId = query.spaceId || '';
    this.setData({ form: emptyForm(spaceId) });

    if (query.id) {
      await this.loadPlace(query.id);
    } else if (!spaceId) {
      const { space } = await callFunction<{ space: Space | null }>('getCurrentSpace');
      if (space) this.setData({ form: Object.assign({}, this.data.form, { spaceId: space._id }) });
    }
  },
  async loadPlace(placeId: string) {
    try {
      const { place } = await callFunction<{ place: Place }>('getPlaceDetail', { placeId });
      this.setData({
        form: {
          placeId: place._id,
          spaceId: place.spaceId,
          name: place.name,
          category: place.category,
          address: place.address,
          latitude: place.latitude,
          longitude: place.longitude,
          poiId: place.poiId,
          visitDate: place.visitDate,
          rating: place.rating,
          content: place.content,
          coverFileId: place.coverFileId,
          photoFileIds: place.photoFileIds || [],
          photoUrls: place.photoUrls || place.photoFileIds || []
        },
        ratingText: formatRating(place.rating)
      });
    } catch (error) {
      showError(error);
    }
  },
  onInput(event: WechatMiniprogram.Input) {
    const field = event.currentTarget.dataset.field as string;
    this.setData({ [`form.${field}`]: event.detail.value });
  },
  onCategoryTap(event: WechatMiniprogram.TouchEvent) {
    const category = event.currentTarget.dataset.value as PlaceCategory;
    this.setData({ form: Object.assign({}, this.data.form, { category }) });
  },
  onDateChange(event: WechatMiniprogram.PickerChange) {
    this.setData({ form: Object.assign({}, this.data.form, { visitDate: String(event.detail.value) }) });
  },
  onRatingChange(event: WechatMiniprogram.SliderChange) {
    const rating = Number(event.detail.value);
    this.setData({ form: Object.assign({}, this.data.form, { rating }), ratingText: formatRating(rating) });
  },
  async onUploadPhotos() {
    const remaining = Math.max(0, 9 - this.data.form.photoFileIds.length);
    if (remaining === 0) {
      wx.showToast({ title: '最多上传9张', icon: 'none' });
      return;
    }
    try {
      const fileIds = await chooseAndUploadImages(this.data.form.spaceId, remaining);
      const photoFileIds = this.data.form.photoFileIds.concat(fileIds);
      const photoUrls = this.data.form.photoUrls.concat(fileIds);
      this.setData({
        form: Object.assign({}, this.data.form, {
          photoUrls,
          photoFileIds,
          coverFileId: this.data.form.coverFileId || photoFileIds[0] || ''
        })
      });
    } catch (error) {
      showError(error);
    }
  },
  onOpenPoi() {
    wx.navigateTo({
      url: `/pages/poi-search/index?latitude=${this.data.form.latitude}&longitude=${this.data.form.longitude}`,
      events: {
        selectedPoi: (poi) => {
          this.setData({
            form: Object.assign({}, this.data.form, {
              name: this.data.form.name || poi.title,
              category: poi.category || this.data.form.category,
              address: poi.address,
              latitude: poi.latitude,
              longitude: poi.longitude,
              poiId: poi.id
            })
          });
        }
      }
    });
  },
  onOpenMapPicker() {
    wx.navigateTo({
      url: `/pages/map-picker/index?latitude=${this.data.form.latitude}&longitude=${this.data.form.longitude}&address=${encodeURIComponent(this.data.form.address)}`,
      events: {
        pickedLocation: (location) => {
          this.setData({
            form: Object.assign({}, this.data.form, {
              address: location.address,
              latitude: location.latitude,
              longitude: location.longitude
            })
          });
        }
      }
    });
  },
  async onSave() {
    const form = this.data.form;
    if (!form.name || !form.address || !form.latitude || !form.longitude) {
      wx.showToast({ title: '请补全地点信息', icon: 'none' });
      return;
    }

    this.setData({ saving: true });
    try {
      const functionName = form.placeId ? 'updatePlace' : 'createPlace';
      const payload = form.placeId ? form : Object.assign({}, form, { placeId: undefined });
      const result = await callFunction<{ placeId: string }>(functionName, payload);
      const placeId = form.placeId || result.placeId;
      wx.redirectTo({ url: `/pages/place-detail/index?id=${placeId}` });
    } catch (error) {
      showError(error);
    } finally {
      this.setData({ saving: false });
    }
  }
});
