import type { Place, PlaceCategory } from '../../types/domain';
import { categoryIcons, categoryLabels, formatRating } from '../../utils/format';

Component({
  properties: {
    place: {
      type: Object,
      value: null
    }
  },
  data: {
    categoryLabel: '',
    ratingText: '',
    icon: '点'
  },
  observers: {
    place(place: Place) {
      if (!place) return;
      const category = place.category as PlaceCategory;
      this.setData({
        categoryLabel: categoryLabels[category],
        ratingText: formatRating(place.rating),
        icon: categoryIcons[category]
      });
    }
  },
  methods: {
    onTap() {
      const place = this.properties.place as Place;
      if (!place?._id) return;
      this.triggerEvent('tapplace', { place });
    }
  }
});
