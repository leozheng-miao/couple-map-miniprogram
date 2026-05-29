const cloud = require('wx-server-sdk');

function normalizeFileIds(fileIds) {
  return Array.from(new Set((fileIds || []).filter((id) => typeof id === 'string' && id.trim())));
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
  const photoFileIds = Array.isArray(place.photoFileIds) ? place.photoFileIds : [];
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
  getTempFileUrlMap,
  withPlaceImageUrls,
  withNoteImageUrl
};
