import type { Place, PlaceCategory } from '../types/domain';

const markerColors: Record<PlaceCategory, string> = {
  restaurant: '#E86A3C',
  hotel: '#7058B9',
  scenic: '#4CA762',
  other: '#A77B5B'
};

export function markerIdFromPlace(place: Place): number {
  const numeric = Number.parseInt(place._id.slice(-6), 16);
  return Number.isFinite(numeric) ? numeric : Math.floor(Math.random() * 1000000);
}

export function toMarker(place: Place): Record<string, unknown> {
  return {
    id: markerIdFromPlace(place),
    latitude: place.latitude,
    longitude: place.longitude,
    title: place.name,
    width: 28,
    height: 28,
    callout: {
      content: place.name,
      color: '#4F3B31',
      fontSize: 12,
      borderRadius: 8,
      bgColor: '#FFFDF9',
      padding: 8,
      display: 'BYCLICK'
    },
    label: {
      content: '●',
      color: markerColors[place.category],
      fontSize: 28,
      anchorX: -10,
      anchorY: -10
    }
  };
}
