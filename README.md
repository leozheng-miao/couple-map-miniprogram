# 情侣地图微信小程序

情侣地图是一款基于微信小程序和微信云开发的双人回忆记录应用。它面向情侣、伴侣或固定旅行搭子，用地图承载一起去过的餐厅、酒店、景点和其他地点，并围绕每个地点记录照片、评分、小记和便利贴。

当前版本为 `1.0.0`，已进入微信审核与上线阶段。

## 核心能力

- 双人情侣空间：支持创建空间、邀请码加入空间、刷新邀请码。
- 地图回忆记录：在地图上展示两个人共同记录过的地点。
- 地点管理：支持新增、编辑、删除餐厅、酒店、景点和其他类型地点。
- POI 搜索：通过腾讯位置服务 WebService API 搜索地点。
- 手动选点：无搜索结果或未配置地图 Key 时，可在地图上手动选择坐标。
- 照片记录：每个地点可上传多张照片，并自动生成封面。
- 便利贴：每个地点可添加文字或图片便利贴，支持多种便签颜色。
- 相册聚合：按空间聚合所有地点照片，并可跳转回对应地点详情。
- 双人共享：同一空间内双方可查看彼此添加的地点、照片和便利贴。
- 数据导出：通过云函数导出空间内的地点、便利贴等数据。

## 版本范围

`1.0.0` 聚焦完整可用的私密双人地图体验，不包含复杂社交关系、公开内容流、商业化、后台管理系统或多空间切换。所有核心读写都通过云函数完成，数据库集合不开放客户端直接写入。

本版本不申请以下微信定位接口：

- `getLocation`
- `onLocationChange`
- `startLocationUpdate`

地点记录依赖用户主动搜索或手动点选地图坐标，不读取用户实时位置。

## 技术栈

- 微信原生小程序
- TypeScript
- 微信云开发
- 云数据库
- 云存储
- 云函数 Node.js
- 腾讯位置服务 WebService API

## 项目结构

```text
.
├── miniprogram/             # 小程序端源码
│   ├── pages/               # 页面
│   ├── components/          # 复用组件
│   ├── utils/               # 云函数、文件、日期、地图等工具
│   ├── types/               # 业务类型定义
│   └── env.ts               # 云环境 ID 和腾讯位置服务 Key
├── cloudfunctions/          # 云函数
│   ├── common/              # 共享源码模板
│   ├── login/
│   ├── createSpace/
│   ├── joinSpace/
│   ├── getCurrentSpace/
│   ├── listPlaces/
│   ├── getPlaceDetail/
│   ├── createPlace/
│   ├── updatePlace/
│   ├── deletePlace/
│   ├── createNote/
│   ├── updateNote/
│   ├── deleteNote/
│   ├── getAlbum/
│   ├── searchPoi/
│   └── exportData/
├── docs/                    # 部署、数据库、云存储、测试和发布文档
├── scripts/                 # 项目检查脚本
├── package.json
└── project.config.json
```

## 页面说明

- `bootstrap`：启动页，负责创建或加入情侣空间。
- `map`：地图首页，展示已记录地点和最近记录。
- `place-form`：新增和编辑地点。
- `poi-search`：搜索餐厅、酒店、景点等 POI。
- `map-picker`：手动地图选点。
- `place-detail`：地点详情、照片和便利贴。
- `note-form`：新增和编辑便利贴。
- `album`：空间相册。
- `profile`：个人中心、邀请码、导出入口和设置入口。

## 云函数说明

| 云函数 | 说明 |
| --- | --- |
| `login` | 登录并创建或更新用户记录 |
| `createSpace` | 创建情侣空间 |
| `joinSpace` | 通过邀请码加入空间 |
| `getCurrentSpace` | 获取当前用户所在空间 |
| `refreshInviteCode` | 刷新邀请码 |
| `listPlaces` | 获取空间内地点列表 |
| `getPlaceDetail` | 获取地点详情和便利贴 |
| `createPlace` | 新增地点 |
| `updatePlace` | 编辑地点 |
| `deletePlace` | 删除地点 |
| `createNote` | 新增便利贴 |
| `updateNote` | 编辑便利贴 |
| `deleteNote` | 删除便利贴 |
| `getAlbum` | 获取空间相册 |
| `searchPoi` | 调用腾讯位置服务搜索地点 |
| `exportData` | 导出空间数据 |

`cloudfunctions/common` 是共享源码模板。每个业务云函数目录内都带有自己的 `common/` 副本，部署时只需要部署具体业务函数目录，不需要部署顶层 `common`。

## 数据集合

云数据库需要创建以下集合：

- `users`
- `spaces`
- `places`
- `notes`
- `checkins`
- `app_config`

建议集合权限设置为所有用户不可读写，业务读写统一通过云函数完成。具体字段结构见 [docs/cloud-database.md](docs/cloud-database.md)。

## 本地开发

安装依赖：

```bash
npm install
```

编译小程序 TypeScript：

```bash
npm run build:miniprogram
```

类型检查：

```bash
npm run typecheck
```

检查云函数语法：

```bash
npm run check:cloud
```

检查 JSON 文件：

```bash
npm run check:json
```

检查未完成标记：

```bash
npm run check:markers
```

## 环境配置

在 `miniprogram/env.ts` 中配置云环境 ID 和腾讯位置服务 Key：

```ts
export const CLOUD_ENV_ID = '你的云开发环境ID';
export const TENCENT_MAP_KEY = '你的腾讯位置服务Key';
```

`TENCENT_MAP_KEY` 用于 POI 搜索。未配置 Key 时，小程序仍可通过手动选点完成地点记录。

## 部署流程

1. 使用微信开发者工具打开项目根目录。
2. 确认 `project.config.json` 中的 AppID 为当前小程序 AppID。
3. 确认 `miniprogram/env.ts` 中的 `CLOUD_ENV_ID` 为当前云开发环境 ID。
4. 在云数据库中创建 `users`、`spaces`、`places`、`notes`、`checkins`、`app_config` 集合。
5. 在微信开发者工具中选择云函数根目录对应的云环境。
6. 逐个部署 `cloudfunctions/` 下的业务云函数，选择“创建并部署：云端安装依赖”。
7. 配置腾讯位置服务 Key，并确认已开启 WebService API。
8. 执行 `npm run build:miniprogram`。
9. 在微信开发者工具中编译、预览、真机测试。
10. 上传代码并提交微信审核。

完整部署教程见 [docs/deployment-tutorial.md](docs/deployment-tutorial.md)。

## 发布检查

上线前建议完成以下检查：

- 核心路径：创建空间、加入空间、新增地点、上传照片、新增便利贴、相册查看。
- 双人共享：双方可互相看到地点、照片和便利贴。
- 云函数：所有业务函数均已部署到正确云环境。
- 云数据库：集合权限符合云函数读写模型。
- 云存储：图片上传、跨用户展示和临时 URL 访问正常。
- 权限审核：不申请定位类接口，仅按实际能力填写隐私保护指引。
- 包体检查：真机调试包体不超过微信限制。

详细清单见 [docs/test-checklist.md](docs/test-checklist.md) 和 [docs/release-checklist.md](docs/release-checklist.md)。

## 设计主题

项目视觉风格为温暖纸张背景、旅行手账卡片、胶带装饰、红色主按钮、便利贴色块和照片优先布局。设计主题参考图保存在：

- [docs/assets/design-theme-reference.png](docs/assets/design-theme-reference.png)

该图片仅作为设计参考，不打包进小程序端。

## 隐私说明

本项目只围绕用户主动创建的情侣空间、地点记录、照片和便利贴进行数据处理。地点坐标来自用户主动搜索或手动选择，不读取用户实时位置。

图片文件通过微信云存储保存，跨用户展示时由云函数在空间成员鉴权后生成临时访问 URL。
