import type { Place, PlaceCategory } from '../../types/domain';
import { categoryIcons, categoryLabels, formatRating } from '../../utils/format';

Component({
  properties: {
    place: {
      type: Object,
      value: {}
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
      const place = (this.properties as unknown as { place: Place }).place;
      if (!place?._id) return;
      this.triggerEvent('tapplace', { place });
    }
  }
});
