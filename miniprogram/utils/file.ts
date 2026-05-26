export async function chooseAndUploadImages(spaceId: string, maxCount: number, folder = 'photos'): Promise<string[]> {
  const chooseResult = await wx.chooseMedia({
    count: maxCount,
    mediaType: ['image'],
    sourceType: ['album', 'camera'],
    sizeType: ['compressed']
  });

  const uploads = chooseResult.tempFiles.map((file, index) => {
    const ext = file.tempFilePath.split('.').pop() || 'jpg';
    const cloudPath = `spaces/${spaceId}/${folder}/${Date.now()}-${index}.${ext}`;
    return wx.cloud.uploadFile({ cloudPath, filePath: file.tempFilePath });
  });

  const results = await Promise.all(uploads);
  return results.map((item) => item.fileID);
}
