# 情侣地图微信小程序

一个基于微信云开发的情侣地图记忆小程序，用来记录两个人一起去过的饭店、酒店、景点和其他地点。项目主题参考图已保存到：

- `docs/assets/design-theme-reference.png`
- `miniprogram/assets/theme/design-theme-reference.png`

前端开发需保持当前主题：温暖纸张背景、旅行手账卡片、胶带装饰、红色主按钮、便利贴色块、照片优先。

## 功能

- 创建情侣空间
- 邀请码加入空间
- 地图展示地点
- 新增和编辑地点
- POI 搜索和手动地图选点
- 照片上传
- 地点详情
- 便利贴
- 相册聚合
- 数据导出

## 目录

```text
miniprogram/       微信小程序端
cloudfunctions/    云函数
docs/              配置、发布、测试文档
docs/assets/       设计主题参考图
```

## 本地打开

1. 使用微信开发者工具打开项目根目录。
2. 在 `project.config.json` 或开发者工具中替换真实 AppID。
3. 在 `miniprogram/env.ts` 设置云环境 ID。
4. 开通云开发并创建文档中的数据库集合。
5. 上传并部署 `cloudfunctions` 下的云函数。
6. 配置腾讯位置服务 Key 后，在 `miniprogram/env.ts` 填写 `TENCENT_MAP_KEY`。

## 云函数部署

每个业务函数目录下都有独立 `package.json`。部署前在微信开发者工具中对每个函数执行安装依赖并上传部署。

`cloudfunctions/common` 是共享源码模板；业务云函数目录内已各自带有 `common/` 副本，部署时直接上传对应业务函数目录即可。

## 发布前阅读

- [云数据库配置](docs/cloud-database.md)
- [云存储规范](docs/cloud-storage.md)
- [腾讯位置服务配置](docs/tencent-location.md)
- [测试清单](docs/test-checklist.md)
- [发布检查清单](docs/release-checklist.md)
