# 情侣地图记忆微信小程序设计规格

## 背景

开发一款给两个人使用的微信小程序，用来记录一起去过的饭店、酒店、景点等地点。每个地点可以在地图上展示，并保存照片、文字记录和便利贴。第一版按上线标准准备，使用微信云开发，不引入 Java 后端。

## 目标

- 你创建情侣空间，女朋友通过邀请码或二维码加入。
- 两个人共享同一套地点、照片、便利贴和相册数据。
- 地图首页能展示去过的地点。
- 每个地点能保存名称、分类、地址、坐标、日期、评分、正文和照片。
- 支持腾讯位置服务 POI 搜索，也支持地图手动选点。
- 支持给地点添加文字或图片便利贴。
- 支持聚合相册浏览。
- 提供上线配置文档、权限规则说明和发布检查清单。

## 非目标

- 不做多情侣空间。
- 不做好友公开分享。
- 不做评论、点赞、动态流。
- 不做支付。
- 不做后台管理系统。
- 不做 Java 后端。
- 不在第一版开放复杂的多次打卡时间线。

## 技术方案

- 小程序端：原生微信小程序 + TypeScript。
- 后端：微信云开发。
- 数据库：云数据库。
- 文件：云存储。
- 服务端逻辑：云函数。
- 地图展示：微信小程序 `map` 组件。
- POI 搜索：腾讯位置服务。
- 权限模型：所有业务数据绑定 `spaceId`，核心读写全部走云函数校验。

## 视觉方向

整体使用温暖手账感。

- 主色：暖米色、珊瑚红、奶油白、柔和棕。
- 地点卡片像旅行手账条目。
- 便利贴使用暖黄、浅粉、浅绿、浅蓝。
- 地图是主功能，但避免冷工具风。
- 照片墙保持大图优先，适合回忆浏览。

## 页面结构

底部 Tab：

- 地图
- 相册
- 我的

普通页面：

- 启动/空间页
- 新增地点页
- 编辑地点页
- 地点详情页
- 便利贴编辑页
- 地图选点页
- POI 搜索页

## 核心流程

### 首次使用

1. 用户进入小程序。
2. 调用 `login` 云函数获取 openid 并创建或更新用户。
3. 如果用户没有 `currentSpaceId`，进入启动/空间页。
4. 用户可以创建情侣空间，或输入邀请码加入已有空间。
5. 加入空间后进入地图首页。

### 创建情侣空间

1. 用户点击创建空间。
2. 调用 `createSpace`。
3. 云函数创建 `spaces` 记录，生成邀请码。
4. 更新用户的 `currentSpaceId`。
5. 用户可在“我的”页面查看邀请码或二维码。

### 加入情侣空间

1. 第二个用户输入邀请码或扫描二维码。
2. 调用 `joinSpace`。
3. 云函数校验邀请码有效。
4. 将用户 openid 加入 `memberOpenids`。
5. 更新用户的 `currentSpaceId`。
6. 双方开始共享同一个空间的数据。

### 新增地点

1. 用户点击地图首页右下角新增按钮。
2. 用户可通过 POI 搜索选择地点，也可手动在地图上选点。
3. 用户填写分类、日期、评分、正文并上传照片。
4. 调用 `createPlace` 保存地点。
5. 地图首页出现对应 marker。

### 地点详情

1. 用户点击地图 marker 或列表卡片。
2. 进入地点详情页。
3. 页面展示封面、地点信息、正文、照片墙、地图小卡片和便利贴。
4. 用户可编辑地点、添加照片、添加便利贴或软删除地点。

### 相册

1. 相册页聚合当前空间内所有地点照片。
2. 支持按分类和地点筛选。
3. 点击照片进入对应地点详情。

## 数据模型

### users

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

### spaces

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

### places

```json
{
  "spaceId": "string",
  "name": "string",
  "category": "restaurant | hotel | scenic | other",
  "address": "string",
  "latitude": 31.2304,
  "longitude": 121.4737,
  "poiId": "string",
  "visitDate": "Date",
  "rating": 5,
  "content": "string",
  "coverFileId": "string",
  "photoFileIds": ["string"],
  "checkinCount": 1,
  "createdBy": "string",
  "createdAt": "Date",
  "updatedAt": "Date",
  "deletedAt": "Date"
}
```

### notes

```json
{
  "spaceId": "string",
  "placeId": "string",
  "text": "string",
  "color": "yellow | pink | green | blue",
  "photoFileId": "string",
  "createdBy": "string",
  "createdAt": "Date",
  "updatedAt": "Date",
  "deletedAt": "Date"
}
```

### checkins

```json
{
  "spaceId": "string",
  "placeId": "string",
  "visitDate": "Date",
  "content": "string",
  "photoFileIds": ["string"],
  "createdBy": "string",
  "createdAt": "Date",
  "updatedAt": "Date",
  "deletedAt": "Date"
}
```

### app_config

```json
{
  "key": "string",
  "value": {},
  "updatedAt": "Date"
}
```

第一版主要使用 `users`、`spaces`、`places`、`notes`。`checkins` 先保留集合和类型设计，用于未来扩展同一个地点多次打卡。

## 云函数

- `login`：获取 openid，创建或更新用户。
- `createSpace`：创建情侣空间，生成邀请码。
- `joinSpace`：通过邀请码加入空间。
- `getCurrentSpace`：获取当前用户空间。
- `refreshInviteCode`：刷新邀请码。
- `listPlaces`：按空间和分类查询地点。
- `getPlaceDetail`：获取地点详情和便利贴。
- `createPlace`：新增地点。
- `updatePlace`：编辑地点。
- `deletePlace`：软删除地点。
- `createNote`：新增便利贴。
- `updateNote`：编辑便利贴。
- `deleteNote`：软删除便利贴。
- `getAlbum`：聚合照片。
- `searchPoi`：调用腾讯位置服务搜索地点。
- `exportData`：导出当前情侣空间数据。

## 权限规则

- 客户端不直接写核心集合。
- 核心集合读写全部走云函数。
- 云函数使用云端权限访问数据库。
- 每次读写都校验当前用户是否属于目标 `spaceId`。
- 用户只能访问自己情侣空间的数据。
- 地点和便利贴删除使用软删除 `deletedAt`。
- 云存储上传可由客户端执行，但文件记录必须经云函数绑定到地点或便利贴。
- 图片不在删除地点时自动删除，避免误删回忆。

## 地图与位置

- 地图首页用 `map` 组件渲染 markers。
- marker 根据分类使用不同图标。
- 点击 marker 展示地点卡片。
- 新增地点时优先支持腾讯位置服务 POI 搜索。
- 没有配置腾讯位置服务 Key 时，手动选点仍可使用。
- 发布说明中包含腾讯位置服务 Key、合法域名、服务开通步骤。

## 错误处理

- 未登录：重新调用 `login`。
- 未加入空间：跳转启动/空间页。
- 邀请码无效或过期：提示重新获取邀请码。
- POI 搜索失败：提示使用地图手动选点。
- 图片上传失败：允许重试，不保存半完成地点。
- 云函数权限校验失败：提示无权访问当前空间数据。
- 地点已删除：详情页提示记录不存在或已删除。

## 测试与验收

- 新用户可创建情侣空间。
- 第二个用户可通过邀请码加入。
- 两人能看到同一批地点。
- 新增饭店、酒店、景点后地图出现标记。
- 地点详情能展示照片和便利贴。
- 删除地点后地图和列表不再显示。
- 相册能聚合所有照片。
- 未加入空间的用户不能访问空间数据。
- 没有腾讯位置服务 Key 时，手动选点仍可用。
- 微信开发者工具可预览。
- 真机预览核心流程可跑通。

## 交付物

- 完整微信小程序项目代码。
- 云函数代码。
- 云数据库集合初始化说明。
- 云存储目录规范。
- 腾讯位置服务配置说明。
- 微信小程序发布配置说明。
- 权限规则说明。
- 测试清单。
- 上线检查清单。
- README。

