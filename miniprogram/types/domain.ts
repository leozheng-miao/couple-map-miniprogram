export type PlaceCategory = 'restaurant' | 'hotel' | 'scenic' | 'entertainment' | 'special' | 'other';
export type NoteColor = 'yellow' | 'pink' | 'green' | 'blue';

export interface AppUser {
  _id?: string;
  _openid: string;
  nickName: string;
  avatarUrl: string;
  currentSpaceId: string;
}

export interface Space {
  _id: string;
  name: string;
  ownerOpenid: string;
  memberOpenids: string[];
  inviteCode: string;
  inviteExpireAt: string;
}

export interface Place {
  _id: string;
  spaceId: string;
  name: string;
  category: PlaceCategory;
  address: string;
  latitude: number;
  longitude: number;
  poiId: string;
  visitDate: string;
  rating: number;
  content: string;
  coverFileId: string;
  coverUrl?: string;
  photoFileIds: string[];
  photoUrls?: string[];
  checkinCount: number;
  createdBy: string;
}

export interface Note {
  _id: string;
  spaceId: string;
  placeId: string;
  text: string;
  color: NoteColor;
  photoFileId: string;
  photoUrl?: string;
  createdBy: string;
}

export interface AlbumPhoto {
  fileId: string;
  url?: string;
  placeId: string;
  placeName: string;
  category: PlaceCategory;
  visitDate: string;
}

export interface PoiItem {
  id: string;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
  category?: PlaceCategory;
}

export interface CloudResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
