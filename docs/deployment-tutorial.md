# 部署与测试教程

## 1. 当前完成状态

代码开发已完成并推送到 GitHub。正式上线前还需要你在微信和腾讯控制台完成账号级配置，并用微信开发者工具完成部署、预览、提审。

## 2. 需要准备的账号和信息

- 微信小程序账号。
- 微信小程序 AppID。
- 微信开发者工具。
- 微信云开发环境 ID。
- 腾讯位置服务 Key。
- 至少两个可测试微信号：你和女朋友，或一个开发者账号加一个体验成员账号。

## 3. 本地项目检查

在项目根目录执行：

```bash
npm install
npm run typecheck
npm run check:cloud
npm run check:json
rg -n "TO[D]O|TB[D]|待[定]|占[位]" miniprogram cloudfunctions README.md docs --glob '!docs/superpowers/**'
```

全部通过后再进入微信开发者工具。

## 4. 配置 AppID

1. 登录微信公众平台。
2. 进入「设置」→「开发设置」。
3. 复制 AppID。
4. 打开项目根目录的 `project.config.json`。
5. 将：

```json
"appid": "touristappid"
```

替换为真实 AppID。

如果不想提交真实 AppID，也可以在微信开发者工具导入项目时手动选择真实 AppID。

## 5. 开通云开发环境

1. 用微信开发者工具打开 `/Users/zhengsmacbook/Desktop/小程序`。
2. 顶部点击「云开发」。
3. 按提示开通云开发环境。
4. 进入云开发控制台「设置」页。
5. 复制环境 ID。
6. 修改 `miniprogram/env.ts`：

```ts
export const CLOUD_ENV_ID = '你的云开发环境ID';
export const TENCENT_MAP_KEY = '';
```

## 6. 创建云数据库集合

在云开发控制台「数据库」中创建以下集合：

- `users`
- `spaces`
- `places`
- `notes`
- `checkins`
- `app_config`

权限建议：

```json
{
  "read": false,
  "write": false
}
```

本项目核心读写都走云函数，不依赖客户端直连数据库。

## 7. 部署云函数

需要部署这些云函数：

- `login`
- `createSpace`
- `joinSpace`
- `getCurrentSpace`
- `refreshInviteCode`
- `listPlaces`
- `getPlaceDetail`
- `createPlace`
- `updatePlace`
- `deletePlace`
- `createNote`
- `updateNote`
- `deleteNote`
- `getAlbum`
- `searchPoi`
- `exportData`

推荐步骤：

1. 在微信开发者工具左侧找到 `cloudfunctions`。
2. 先进入每个云函数目录执行依赖安装，或在开发者工具里选择「上传并部署：云端安装依赖」。
3. 对每个函数右键选择「上传并部署：云端安装依赖」。
4. 部署完成后，在云开发控制台「云函数」确认函数列表里都有对应函数。
5. 打开云函数日志，后续测试失败时优先看日志。

注意：业务云函数目录内已经包含 `common/` 共享代码副本。如果你修改了 `cloudfunctions/common` 源模板，需要同步到各业务函数目录后再部署。

如果某个函数部署时报 `wx-server-sdk` 找不到，请在该函数目录本地执行：

```bash
npm install
```

然后在微信开发者工具中选择「上传并部署：所有文件」。

## 8. 配置腾讯位置服务

1. 打开腾讯位置服务控制台。
2. 创建应用。
3. 创建 Key。
4. 启用 WebService API。
5. 将 Key 写入 `miniprogram/env.ts`：

```ts
export const TENCENT_MAP_KEY = '你的腾讯位置服务Key';
```

本项目没有 Key 时仍可使用手动地图选点；配置 Key 后才支持 POI 搜索。

## 9. 微信权限与隐私配置

本项目不申请 `getLocation`、`onLocationChange`、`startLocationUpdate`。地图首页只展示已记录地点，新增地点通过 POI 搜索或手动点选地图坐标完成，不读取用户实时位置。

在微信公众平台提审前，用户隐私保护指引只需要按实际能力说明图片选择、图片上传、云存储等用途；不要填写定位类接口使用场景。

## 10. 开发者工具测试流程

1. 点击「编译」。
2. 首次进入应看到启动页。
3. 点击「创建空间」。
4. 进入地图首页。
5. 点击右下角新增地点。
6. 不配置地图 Key 时，测试手动选点。
7. 配置地图 Key 后，测试搜索饭店、酒店、景点。
8. 上传照片。
9. 保存地点。
10. 回到地图页，确认 marker 出现。
11. 进入地点详情，确认照片和正文显示。
12. 新建便利贴。
13. 进入相册，确认照片聚合。
14. 进入我的，复制邀请码。

## 11. 双人共享测试流程

1. 将女朋友微信号添加为体验成员或开发者。
2. 用你的微信真机预览，创建空间。
3. 在「我的」页复制邀请码。
4. 让第二个微信扫码预览同一个体验版。
5. 第二个微信选择「加入已有空间」。
6. 输入邀请码。
7. 两台手机都进入地图页。
8. 你新增一个地点。
9. 第二台手机下拉或重新进入地图页，应看到同一个地点。
10. 第二台手机新增便利贴。
11. 你的手机进入地点详情，应看到便利贴。

## 12. 真机预览测试流程

在微信开发者工具点击「预览」，用手机扫码。

必须验证：

- 启动页不白屏。
- 创建空间成功。
- 邀请码加入成功。
- 地图可以显示。
- 获取位置授权弹窗正常。
- 手动选点成功。
- POI 搜索成功。
- 图片上传成功。
- 地点保存成功。
- 便利贴保存成功。
- 相册能展示照片。
- 删除地点后地图不再展示。

## 13. 上传代码

1. 微信开发者工具右上角点击「上传」。
2. 版本号建议填写：

```text
1.0.0
```

3. 项目备注建议填写：

```text
情侣地图第一版：地图记录、照片、便利贴、情侣空间
```

4. 上传后进入微信公众平台。

## 14. 提交审核

1. 登录微信公众平台。
2. 进入「管理」→「版本管理」。
3. 找到刚上传的开发版本。
4. 点击「提交审核」。
5. 选择服务类目。
6. 填写功能页面。
7. 如果要求测试账号，提供测试说明：

```text
测试方式：
1. 进入小程序后点击创建空间。
2. 在地图页新增地点。
3. 上传图片并保存。
4. 进入地点详情新增便利贴。
5. 进入相册查看照片。

如需测试双人共享，可使用邀请码加入已有空间。
```

8. 提交审核。

## 15. 审核通过后发布

审核通过后不会自动上线，需要你在微信公众平台「版本管理」手动点击「发布」。

## 16. 常见问题

### 云函数不存在

现象：

```text
function not exists
```

处理：

- 确认对应云函数已上传部署。
- 确认函数名和目录名完全一致。
- 重新上传并部署。

### 非法 env

处理：

- 检查 `miniprogram/env.ts` 的 `CLOUD_ENV_ID`。
- 检查小程序 AppID 是否关联到该云开发环境。

### 数据库权限错误

处理：

- 确认集合已创建。
- 确认云函数部署成功。
- 查看云函数日志里的具体错误。

### 定位接口审核不通过

处理：

- 确认使用的是最新代码。
- 确认 `miniprogram/app.json` 不包含 `permission.scope.userLocation`。
- 确认 `miniprogram/app.json` 不包含 `requiredPrivateInfos`。
- 确认代码中没有 `wx.getLocation`、`wx.onLocationChange`、`wx.startLocationUpdate`。
- 在微信公众平台接口申请中移除 `getLocation`、`onLocationChange`、`startLocationUpdate`。

### POI 搜索失败

处理：

- 确认 `TENCENT_MAP_KEY` 不为空。
- 确认腾讯位置服务 Key 已启用 WebService API。
- 确认云函数 `searchPoi` 已部署。
- 查看 `searchPoi` 云函数日志。
