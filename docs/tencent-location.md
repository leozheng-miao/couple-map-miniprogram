# 腾讯位置服务配置

## 开通步骤

1. 打开腾讯位置服务控制台。
2. 创建应用。
3. 创建 Key。
4. 启用 WebService API。
5. 在微信小程序后台配置相关服务权限。
6. 将 Key 填入 `miniprogram/env.ts` 的 `TENCENT_MAP_KEY`。

```ts
export const TENCENT_MAP_KEY = '你的腾讯位置服务Key';
```

## 小程序端行为

- `TENCENT_MAP_KEY` 有值时，新增地点页可以搜索 POI。
- `TENCENT_MAP_KEY` 为空时，搜索页提示使用手动选点。
- 手动选点不依赖腾讯位置服务 Key。

## 云函数

`searchPoi` 云函数调用：

```text
https://apis.map.qq.com/ws/place/v1/search
```

请求参数包含：

- `keyword`
- `boundary`
- `page_size`
- `key`

## 发布检查

- 确认 Key 不受错误域名限制影响云函数请求。
- 确认小程序地图组件权限已开通。
- 真机预览搜索饭店、酒店、景点各一次。
