import type { NoteColor, PlaceCategory } from '../types/domain';

export const categoryLabels: Record<PlaceCategory, string> = {
  restaurant: '餐厅',
  hotel: '酒店',
  scenic: '景点',
  entertainment: '娱乐',
  special: '特殊',
  other: '其他'
};

export const categoryIcons: Record<PlaceCategory, string> = {
  restaurant: '餐',
  hotel: '宿',
  scenic: '景',
  entertainment: '乐',
  special: '特',
  other: '点'
};

export const noteColorLabels: Record<NoteColor, string> = {
  yellow: '暖黄',
  pink: '浅粉',
  green: '浅绿',
  blue: '浅蓝'
};

export function formatRating(rating: number): string {
  return '♥'.repeat(Math.max(0, Math.min(5, Math.round(rating))));
}
