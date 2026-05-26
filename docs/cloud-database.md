# 云数据库配置

## 集合

创建以下集合：

- `users`
- `spaces`
- `places`
- `notes`
- `checkins`
- `app_config`

## users

```json
{
  "_openid": "string",
  "nickName": "string",
  "avatarUrl": "string",
  "currentSpaceId": "string",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## spaces

```json
{
  "name": "string",
  "ownerOpenid": "string",
  "memberOpenids": ["string"],
  "inviteCode": "string",
  "inviteExpireAt": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## places

```json
{
  "spaceId": "string",
  "name": "string",
  "category": "restaurant",
  "address": "string",
  "latitude": 31.2304,
  "longitude": 121.4737,
  "poiId": "string",
  "visitDate": "2026-05-26",
  "rating": 5,
  "content": "string",
  "coverFileId": "cloud://file-id",
  "photoFileIds": ["cloud://file-id"],
  "checkinCount": 1,
  "createdBy": "openid",
  "createdAt": "Date",
  "updatedAt": "Date",
  "deletedAt": null
}
```

## notes

```json
{
  "spaceId": "string",
  "placeId": "string",
  "text": "string",
  "color": "yellow",
  "photoFileId": "cloud://file-id",
  "createdBy": "openid",
  "createdAt": "Date",
  "updatedAt": "Date",
  "deletedAt": null
}
```

## checkins

第一版预留，不开放复杂时间线。

```json
{
  "spaceId": "string",
  "placeId": "string",
  "visitDate": "2026-05-26",
  "content": "string",
  "photoFileIds": ["cloud://file-id"],
  "createdBy": "openid",
  "createdAt": "Date",
  "updatedAt": "Date",
  "deletedAt": null
}
```

## 权限建议

核心集合不允许客户端直接写入，所有读写通过云函数完成。云函数会校验当前 openid 是否属于目标 `spaceId`。

建议集合权限：

```json
{
  "read": false,
  "write": false
}
```

如需开发调试，可临时打开读权限，发布前恢复为云函数读写。

## 索引建议

- `users`: `_openid`
- `spaces`: `inviteCode`
- `places`: `spaceId`, `category`, `deletedAt`, `visitDate`
- `notes`: `spaceId`, `placeId`, `deletedAt`, `createdAt`
