const cloud = require('wx-server-sdk');

function normalizeFileIds(fileIds) {
  return Array.from(new Set((fileIds || []).filter((id) => typeof id === 'string' && id.trim())));
}

function orderPlacePhotoFileIds(place) {
  const photoFileIds = normalizeFileIds(Array.isArray(place.photoFileIds) ? place.photoFileIds : []);
  const coverFileId = typeof place.coverFileId === 'string' ? place.coverFileId.trim() : '';
  if (!coverFileId || !photoFileIds.includes(coverFileId)) {
    return photoFileIds;
  }
  return [coverFileId, ...photoFileIds.filter((fileId) => fileId !== coverFileId)];
}

async function getTempFileUrlMap(fileIds) {
  const normalized = normalizeFileIds(fileIds);
  if (normalized.length === 0) return {};

  const result = await cloud.getTempFileURL({ fileList: normalized });
  return (result.fileList || []).reduce((map, item) => {
    if (item.fileID) {
      map[item.fileID] = item.tempFileURL || item.fileID;
    }
    return map;
  }, {});
}

function withPlaceImageUrls(place, urlMap) {
  const photoFileIds = orderPlacePhotoFileIds(place);
  return {
    ...place,
    coverUrl: place.coverFileId ? urlMap[place.coverFileId] || place.coverFileId : '',
    photoUrls: photoFileIds.map((fileId) => urlMap[fileId] || fileId)
  };
}

function withNoteImageUrl(note, urlMap) {
  return {
    ...note,
    photoUrl: note.photoFileId ? urlMap[note.photoFileId] || note.photoFileId : ''
  };
}

module.exports = {
  orderPlacePhotoFileIds,
  getTempFileUrlMap,
  withPlaceImageUrls,
  withNoteImageUrl
};
