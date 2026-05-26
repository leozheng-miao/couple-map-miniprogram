Component({
  properties: {
    photos: {
      type: Array,
      value: []
    }
  },
  methods: {
    onPreview(event: WechatMiniprogram.TouchEvent) {
      const current = event.currentTarget.dataset.file as string;
      const urls = this.properties.photos as string[];
      if (!current || urls.length === 0) return;
      wx.previewImage({ current, urls });
    }
  }
});
