Page({
  data: {
    latitude: 31.2304,
    longitude: 121.4737,
    address: '',
    markers: [] as WechatMiniprogram.MapMarker[]
  },
  onLoad(query: Record<string, string>) {
    const latitude = Number(query.latitude) || 31.2304;
    const longitude = Number(query.longitude) || 121.4737;
    const address = decodeURIComponent(query.address || '');
    this.setLocation(latitude, longitude, address);
    if (!query.latitude || !query.longitude) {
      wx.getLocation({
        type: 'gcj02',
        success: (result) => this.setLocation(result.latitude, result.longitude, address)
      });
    }
  },
  setLocation(latitude: number, longitude: number, address = this.data.address) {
    this.setData({
      latitude,
      longitude,
      address,
      markers: [
        {
          id: 1,
          latitude,
          longitude,
          title: '选择的位置',
          width: 28,
          height: 28,
          label: {
            content: '＋',
            color: '#E94B43',
            fontSize: 28,
            anchorX: -10,
            anchorY: -12
          }
        }
      ]
    });
  },
  onMapTap(event: WechatMiniprogram.MapTap) {
    this.setLocation(event.detail.latitude, event.detail.longitude);
  },
  onAddressInput(event: WechatMiniprogram.Input) {
    this.setData({ address: event.detail.value });
  },
  onConfirm() {
    const channel = this.getOpenerEventChannel();
    channel.emit('pickedLocation', {
      latitude: this.data.latitude,
      longitude: this.data.longitude,
      address: this.data.address || `${this.data.latitude.toFixed(6)}, ${this.data.longitude.toFixed(6)}`
    });
    wx.navigateBack();
  }
});
