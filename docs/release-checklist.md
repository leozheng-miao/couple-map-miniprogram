# 发布检查清单

## 小程序配置

- 替换真实 AppID。
- 设置 `miniprogram/env.ts` 中的 `CLOUD_ENV_ID`。
- 设置 `miniprogram/env.ts` 中的 `TENCENT_MAP_KEY`。
- 确认微信开发者工具基础库版本支持云开发。

## 云开发

- 开通云开发环境。
- 创建 `users` 集合。
- 创建 `spaces` 集合。
- 创建 `places` 集合。
- 创建 `notes` 集合。
- 创建 `checkins` 集合。
- 创建 `app_config` 集合。
- 配置集合权限为核心读写走云函数。
- 上传部署 `login`。
- 上传部署 `createSpace`。
- 上传部署 `joinSpace`。
- 上传部署 `getCurrentSpace`。
- 上传部署 `refreshInviteCode`。
- 上传部署 `listPlaces`。
- 上传部署 `getPlaceDetail`。
- 上传部署 `createPlace`。
- 上传部署 `updatePlace`。
- 上传部署 `deletePlace`。
- 上传部署 `createNote`。
- 上传部署 `updateNote`。
- 上传部署 `deleteNote`。
- 上传部署 `getAlbum`。
- 上传部署 `searchPoi`。
- 上传部署 `exportData`。

## 腾讯位置服务

- 创建腾讯位置服务应用。
- 创建 Key。
- 开启 WebService API。
- 真机测试地点搜索。
- 真机测试手动选点兜底。

## 发布前验收

- 跑完 `docs/test-checklist.md`。
- 清理调试日志。
- 检查没有提交真实私密 Key。
- 真机预览核心路径无阻塞。
- 提交微信审核。
