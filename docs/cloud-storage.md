# 云存储规范

## 路径

地点照片：

```text
spaces/{spaceId}/photos/{timestamp}-{index}.{ext}
```

便利贴照片：

```text
spaces/{spaceId}/notes/{timestamp}-{index}.{ext}
```

导出文件：

```text
exports/{spaceId}/{timestamp}.json
```

## 删除策略

第一版删除地点和便利贴时只做数据库软删除，不自动删除云存储文件，避免误删回忆。

后续可以增加回收站和无引用文件清理函数。

## 权限

客户端可以上传图片，但图片必须通过云函数绑定到地点或便利贴记录。核心集合中只保存 `fileID`，页面展示时直接使用该 `fileID`。
