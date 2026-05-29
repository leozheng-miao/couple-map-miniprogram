const cloud = require('wx-server-sdk');
const { getOpenId } = require('./common/context');
const { ok, fail } = require('./common/response');
const { requirePlaceAccess } = require('./common/auth');
const { getTempFileUrlMap, withNoteImageUrl, withPlaceImageUrls } = require('./common/media');
const { requireString } = require('./common/validators');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  const db = cloud.database();
  const _ = db.command;
  const OPENID = getOpenId(event);

  try {
    const placeId = requireString(event.placeId, '地点ID');
    const { place } = await requirePlaceAccess(OPENID, placeId);
    const notesResult = await db.collection('notes')
      .where({ placeId, deletedAt: _.eq(null) })
      .orderBy('createdAt', 'desc')
      .get();

    const placePhotoFileIds = Array.isArray(place.photoFileIds) ? place.photoFileIds : [];
    const notePhotoFileIds = notesResult.data.map((note) => note.photoFileId);
    const urlMap = await getTempFileUrlMap([place.coverFileId, ...placePhotoFileIds, ...notePhotoFileIds]);

    return ok({
      place: withPlaceImageUrls(place, urlMap),
      notes: notesResult.data.map((note) => withNoteImageUrl(note, urlMap))
    });
  } catch (error) {
    return fail(error.message || '获取地点详情失败', 'GET_PLACE_DETAIL_FAILED');
  }
};
