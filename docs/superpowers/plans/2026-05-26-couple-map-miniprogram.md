# Couple Map Miniprogram Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a publish-ready WeChat CloudBase miniprogram for a two-person shared map of restaurants, hotels, scenic spots, photos, and sticky notes.

**Architecture:** The miniprogram uses native WeChat miniprogram pages with TypeScript and a CloudBase backend. All sensitive reads and writes go through cloud functions that validate the current user's `spaceId` membership before touching core collections.

**Tech Stack:** WeChat miniprogram TypeScript, CloudBase cloud functions on Node.js, cloud database, cloud storage, Tencent Location Service, Jest-style helper tests where local pure functions exist.

---

## Scope Check

This spec includes UI, cloud functions, storage, permissions, and deployment docs, but these pieces belong to one tightly coupled first release. Keep one implementation plan, split into small commits by layer.

## File Structure

Create this project layout:

```text
.
├── README.md
├── project.config.json
├── project.private.config.json
├── sitemap.json
├── tsconfig.json
├── miniprogram/
│   ├── app.json
│   ├── app.ts
│   ├── app.wxss
│   ├── env.ts
│   ├── types/
│   │   └── domain.ts
│   ├── utils/
│   │   ├── cloud.ts
│   │   ├── date.ts
│   │   ├── file.ts
│   │   ├── format.ts
│   │   └── map.ts
│   ├── components/
│   │   ├── empty-state/
│   │   ├── photo-grid/
│   │   ├── place-card/
│   │   └── sticky-note/
│   ├── assets/
│   │   └── icons/
│   └── pages/
│       ├── bootstrap/
│       ├── map/
│       ├── album/
│       ├── profile/
│       ├── place-form/
│       ├── place-detail/
│       ├── note-form/
│       ├── map-picker/
│       └── poi-search/
├── cloudfunctions/
│   ├── common/
│   │   ├── auth.js
│   │   ├── constants.js
│   │   ├── response.js
│   │   └── validators.js
│   ├── login/
│   ├── createSpace/
│   ├── joinSpace/
│   ├── getCurrentSpace/
│   ├── refreshInviteCode/
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
└── docs/
    ├── cloud-database.md
    ├── cloud-storage.md
    ├── tencent-location.md
    ├── release-checklist.md
    └── test-checklist.md
```

## Shared Conventions

Use these category and note color values everywhere:

```ts
export type PlaceCategory = 'restaurant' | 'hotel' | 'scenic' | 'other';
export type NoteColor = 'yellow' | 'pink' | 'green' | 'blue';
```

Cloud function responses must use one shape:

```js
function ok(data = {}) {
  return { success: true, data };
}

function fail(message, code = 'BAD_REQUEST', details = null) {
  return { success: false, error: { code, message, details } };
}
```

---

### Task 1: Scaffold Miniprogram Project

**Files:**
- Create: `project.config.json`
- Create: `project.private.config.json`
- Create: `sitemap.json`
- Create: `tsconfig.json`
- Create: `miniprogram/env.ts`
- Create: `miniprogram/app.json`
- Create: `miniprogram/app.ts`
- Create: `miniprogram/app.wxss`

- [ ] **Step 1: Create root project config files**

Create `project.config.json`:

```json
{
  "appid": "touristappid",
  "projectname": "couple-map-miniprogram",
  "miniprogramRoot": "miniprogram/",
  "cloudfunctionRoot": "cloudfunctions/",
  "setting": {
    "urlCheck": true,
    "es6": true,
    "enhance": true,
    "postcss": true,
    "minified": true,
    "compileHotReLoad": true
  },
  "compileType": "miniprogram",
  "libVersion": "latest",
  "srcMiniprogramRoot": "miniprogram/",
  "condition": {}
}
```

Create `project.private.config.json`:

```json
{
  "description": "Local developer overrides. Replace appid in WeChat DevTools instead of committing a real personal AppID."
}
```

Create `sitemap.json`:

```json
{
  "rules": [
    {
      "action": "allow",
      "page": "*"
    }
  ]
}
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "strict": true,
    "noImplicitAny": false,
    "strictNullChecks": true,
    "esModuleInterop": true,
    "types": ["miniprogram-api-typings"]
  },
  "include": ["miniprogram/**/*.ts"]
}
```

- [ ] **Step 2: Create app shell**

Create `miniprogram/env.ts`:

```ts
export const CLOUD_ENV_ID = '';
export const TENCENT_MAP_KEY = '';
```

Create `miniprogram/app.json`:

```json
{
  "pages": [
    "pages/bootstrap/index",
    "pages/map/index",
    "pages/album/index",
    "pages/profile/index",
    "pages/place-form/index",
    "pages/place-detail/index",
    "pages/note-form/index",
    "pages/map-picker/index",
    "pages/poi-search/index"
  ],
  "window": {
    "navigationBarTitleText": "我们的地图",
    "navigationBarBackgroundColor": "#F8F1EA",
    "navigationBarTextStyle": "black",
    "backgroundColor": "#F8F1EA"
  },
  "tabBar": {
    "color": "#8B7468",
    "selectedColor": "#E76F61",
    "backgroundColor": "#FFFDF9",
    "borderStyle": "white",
    "list": [
      {
        "pagePath": "pages/map/index",
        "text": "地图"
      },
      {
        "pagePath": "pages/album/index",
        "text": "相册"
      },
      {
        "pagePath": "pages/profile/index",
        "text": "我的"
      }
    ]
  },
  "style": "v2",
  "sitemapLocation": "sitemap.json"
}
```

Create `miniprogram/app.ts`:

```ts
import { CLOUD_ENV_ID } from './env';

App<IAppOption>({
  globalData: {
    currentSpaceId: '',
    user: null
  },
  onLaunch() {
    if (!wx.cloud) {
      wx.showModal({
        title: '基础库版本过低',
        content: '请使用 2.2.3 或以上的基础库以支持云开发。',
        showCancel: false
      });
      return;
    }

    wx.cloud.init({
      env: CLOUD_ENV_ID || undefined,
      traceUser: true
    });
  }
});
```

Create `miniprogram/app.wxss`:

```css
page {
  min-height: 100%;
  background: #f8f1ea;
  color: #4f3b31;
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif;
}

.safe-page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 24rpx;
}

.primary-button {
  border-radius: 999rpx;
  background: #e76f61;
  color: #fff;
  font-weight: 600;
}

.secondary-button {
  border-radius: 999rpx;
  background: #fff7ef;
  color: #7d5f50;
  border: 1rpx solid #ead9cc;
}
```

- [ ] **Step 3: Open in WeChat DevTools**

Run: open `/Users/zhengsmacbook/Desktop/小程序` in WeChat DevTools.

Expected: project loads with cloud function root and miniprogram root recognized.

- [ ] **Step 4: Commit**

```bash
git add project.config.json project.private.config.json sitemap.json tsconfig.json miniprogram/env.ts miniprogram/app.json miniprogram/app.ts miniprogram/app.wxss
git commit -m "chore: scaffold miniprogram project"
```

---

### Task 2: Add Shared Types, Utilities, and Components

**Files:**
- Create: `miniprogram/types/domain.ts`
- Create: `miniprogram/utils/cloud.ts`
- Create: `miniprogram/utils/date.ts`
- Create: `miniprogram/utils/file.ts`
- Create: `miniprogram/utils/format.ts`
- Create: `miniprogram/utils/map.ts`
- Create: component folders under `miniprogram/components/`

- [ ] **Step 1: Create domain types**

Create `miniprogram/types/domain.ts`:

```ts
export type PlaceCategory = 'restaurant' | 'hotel' | 'scenic' | 'other';
export type NoteColor = 'yellow' | 'pink' | 'green' | 'blue';

export interface AppUser {
  _id?: string;
  _openid: string;
  nickName: string;
  avatarUrl: string;
  currentSpaceId: string;
}

export interface Space {
  _id: string;
  name: string;
  ownerOpenid: string;
  memberOpenids: string[];
  inviteCode: string;
  inviteExpireAt: string;
}

export interface Place {
  _id: string;
  spaceId: string;
  name: string;
  category: PlaceCategory;
  address: string;
  latitude: number;
  longitude: number;
  poiId: string;
  visitDate: string;
  rating: number;
  content: string;
  coverFileId: string;
  photoFileIds: string[];
  checkinCount: number;
  createdBy: string;
}

export interface Note {
  _id: string;
  spaceId: string;
  placeId: string;
  text: string;
  color: NoteColor;
  photoFileId: string;
  createdBy: string;
}

export interface CloudResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

- [ ] **Step 2: Create cloud call helper**

Create `miniprogram/utils/cloud.ts`:

```ts
import type { CloudResult } from '../types/domain';

export async function callFunction<T>(name: string, data: Record<string, unknown> = {}): Promise<T> {
  const result = await wx.cloud.callFunction({ name, data });
  const payload = result.result as CloudResult<T>;

  if (!payload || payload.success !== true) {
    const message = payload?.error?.message || '请求失败，请稍后重试';
    throw new Error(message);
  }

  return payload.data as T;
}

export function showError(error: unknown): void {
  const message = error instanceof Error ? error.message : '操作失败，请稍后重试';
  wx.showToast({ title: message, icon: 'none' });
}
```

- [ ] **Step 3: Create formatting helpers**

Create `miniprogram/utils/date.ts`:

```ts
export function today(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDate(value: string): string {
  if (!value) return '';
  return value.slice(0, 10);
}
```

Create `miniprogram/utils/format.ts`:

```ts
import type { PlaceCategory } from '../types/domain';

export const categoryLabels: Record<PlaceCategory, string> = {
  restaurant: '饭店',
  hotel: '酒店',
  scenic: '景点',
  other: '其他'
};

export function formatRating(rating: number): string {
  return '★'.repeat(Math.max(0, Math.min(5, rating)));
}
```

Create `miniprogram/utils/map.ts`:

```ts
import type { Place, PlaceCategory } from '../types/domain';

const markerColors: Record<PlaceCategory, string> = {
  restaurant: '#E76F61',
  hotel: '#7BA7BC',
  scenic: '#88A86B',
  other: '#C59B6D'
};

export function toMarker(place: Place): WechatMiniprogram.MapMarker {
  return {
    id: Number.parseInt(place._id.slice(-6), 16) || Date.now(),
    latitude: place.latitude,
    longitude: place.longitude,
    title: place.name,
    width: 28,
    height: 28,
    callout: {
      content: place.name,
      color: '#4F3B31',
      fontSize: 12,
      borderRadius: 8,
      bgColor: '#FFFDF9',
      padding: 8,
      display: 'BYCLICK'
    },
    label: {
      content: '●',
      color: markerColors[place.category],
      fontSize: 24,
      anchorX: -8,
      anchorY: -8
    }
  };
}
```

- [ ] **Step 4: Create upload helper**

Create `miniprogram/utils/file.ts`:

```ts
export async function chooseAndUploadImages(spaceId: string, maxCount: number): Promise<string[]> {
  const chooseResult = await wx.chooseMedia({
    count: maxCount,
    mediaType: ['image'],
    sourceType: ['album', 'camera'],
    sizeType: ['compressed']
  });

  const uploads = chooseResult.tempFiles.map((file, index) => {
    const ext = file.tempFilePath.split('.').pop() || 'jpg';
    const cloudPath = `spaces/${spaceId}/photos/${Date.now()}-${index}.${ext}`;
    return wx.cloud.uploadFile({ cloudPath, filePath: file.tempFilePath });
  });

  const results = await Promise.all(uploads);
  return results.map((item) => item.fileID);
}
```

- [ ] **Step 5: Commit**

```bash
git add miniprogram/types miniprogram/utils
git commit -m "feat: add shared miniprogram utilities"
```

---

### Task 3: Add Cloud Function Common Layer

**Files:**
- Create: `cloudfunctions/common/constants.js`
- Create: `cloudfunctions/common/response.js`
- Create: `cloudfunctions/common/validators.js`
- Create: `cloudfunctions/common/auth.js`

- [ ] **Step 1: Create common response and constants**

Create `cloudfunctions/common/constants.js`:

```js
const PLACE_CATEGORIES = ['restaurant', 'hotel', 'scenic', 'other'];
const NOTE_COLORS = ['yellow', 'pink', 'green', 'blue'];

module.exports = {
  PLACE_CATEGORIES,
  NOTE_COLORS
};
```

Create `cloudfunctions/common/response.js`:

```js
function ok(data = {}) {
  return { success: true, data };
}

function fail(message, code = 'BAD_REQUEST', details = null) {
  return { success: false, error: { code, message, details } };
}

module.exports = {
  ok,
  fail
};
```

- [ ] **Step 2: Create validators**

Create `cloudfunctions/common/validators.js`:

```js
const { PLACE_CATEGORIES, NOTE_COLORS } = require('./constants');

function requireString(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${field}不能为空`);
  }
  return value.trim();
}

function optionalString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function requireNumber(value, field) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new Error(`${field}必须是数字`);
  }
  return number;
}

function requireCategory(value) {
  if (!PLACE_CATEGORIES.includes(value)) {
    throw new Error('地点分类无效');
  }
  return value;
}

function requireNoteColor(value) {
  if (!NOTE_COLORS.includes(value)) {
    throw new Error('便利贴颜色无效');
  }
  return value;
}

module.exports = {
  requireString,
  optionalString,
  requireNumber,
  requireCategory,
  requireNoteColor
};
```

- [ ] **Step 3: Create auth helper**

Create `cloudfunctions/common/auth.js`:

```js
const cloud = require('wx-server-sdk');

function getDb() {
  return cloud.database();
}

async function getUser(openid) {
  const db = getDb();
  const result = await db.collection('users').where({ _openid: openid }).limit(1).get();
  return result.data[0] || null;
}

async function requireUser(openid) {
  const user = await getUser(openid);
  if (!user) {
    throw new Error('请先登录');
  }
  return user;
}

async function requireSpaceMember(openid, spaceId) {
  const db = getDb();
  const user = await requireUser(openid);
  const result = await db.collection('spaces').doc(spaceId).get();
  const space = result.data;

  if (!space || !Array.isArray(space.memberOpenids) || !space.memberOpenids.includes(openid)) {
    throw new Error('无权访问当前情侣空间');
  }

  return { user, space };
}

module.exports = {
  getDb,
  getUser,
  requireUser,
  requireSpaceMember
};
```

- [ ] **Step 4: Commit**

```bash
git add cloudfunctions/common
git commit -m "feat: add cloud function common helpers"
```

---

### Task 4: Implement Auth and Space Cloud Functions

**Files:**
- Create: `cloudfunctions/login/index.js`
- Create: `cloudfunctions/createSpace/index.js`
- Create: `cloudfunctions/joinSpace/index.js`
- Create: `cloudfunctions/getCurrentSpace/index.js`
- Create: `cloudfunctions/refreshInviteCode/index.js`
- Create package files for each function

- [ ] **Step 1: Create shared package template for each function**

For every function in this task, create `package.json` with:

```json
{
  "dependencies": {
    "wx-server-sdk": "latest"
  }
}
```

- [ ] **Step 2: Implement `login`**

Create `cloudfunctions/login/index.js`:

```js
const cloud = require('wx-server-sdk');
const { ok, fail } = require('../common/response');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  const db = cloud.database();
  const { OPENID } = cloud.getWXContext();
  const now = new Date();

  try {
    const nickName = typeof event.nickName === 'string' ? event.nickName : '';
    const avatarUrl = typeof event.avatarUrl === 'string' ? event.avatarUrl : '';
    const existing = await db.collection('users').where({ _openid: OPENID }).limit(1).get();

    if (existing.data.length === 0) {
      const user = {
        _openid: OPENID,
        nickName,
        avatarUrl,
        currentSpaceId: '',
        createdAt: now,
        updatedAt: now
      };
      await db.collection('users').add({ data: user });
      return ok({ user });
    }

    const user = existing.data[0];
    await db.collection('users').doc(user._id).update({
      data: {
        nickName: nickName || user.nickName || '',
        avatarUrl: avatarUrl || user.avatarUrl || '',
        updatedAt: now
      }
    });

    return ok({
      user: {
        ...user,
        nickName: nickName || user.nickName || '',
        avatarUrl: avatarUrl || user.avatarUrl || ''
      }
    });
  } catch (error) {
    return fail(error.message || '登录失败', 'LOGIN_FAILED');
  }
};
```

- [ ] **Step 3: Implement space functions**

Create `cloudfunctions/createSpace/index.js`:

```js
const cloud = require('wx-server-sdk');
const { ok, fail } = require('../common/response');
const { requireUser } = require('../common/auth');
const { optionalString } = require('../common/validators');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

function createInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

exports.main = async (event) => {
  const db = cloud.database();
  const { OPENID } = cloud.getWXContext();
  const now = new Date();

  try {
    const user = await requireUser(OPENID);
    if (user.currentSpaceId) {
      throw new Error('你已经加入情侣空间');
    }

    const name = optionalString(event.name) || '我们的地图';
    const inviteCode = createInviteCode();
    const inviteExpireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const addResult = await db.collection('spaces').add({
      data: {
        name,
        ownerOpenid: OPENID,
        memberOpenids: [OPENID],
        inviteCode,
        inviteExpireAt,
        createdAt: now,
        updatedAt: now
      }
    });

    await db.collection('users').doc(user._id).update({
      data: {
        currentSpaceId: addResult._id,
        updatedAt: now
      }
    });

    return ok({ spaceId: addResult._id, inviteCode, inviteExpireAt });
  } catch (error) {
    return fail(error.message || '创建空间失败', 'CREATE_SPACE_FAILED');
  }
};
```

Create `cloudfunctions/joinSpace/index.js`:

```js
const cloud = require('wx-server-sdk');
const { ok, fail } = require('../common/response');
const { requireUser } = require('../common/auth');
const { requireString } = require('../common/validators');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  const db = cloud.database();
  const _ = db.command;
  const { OPENID } = cloud.getWXContext();
  const now = new Date();

  try {
    const user = await requireUser(OPENID);
    const inviteCode = requireString(event.inviteCode, '邀请码').toUpperCase();
    const result = await db.collection('spaces').where({ inviteCode }).limit(1).get();
    const space = result.data[0];

    if (!space) {
      throw new Error('邀请码无效');
    }
    if (new Date(space.inviteExpireAt).getTime() < Date.now()) {
      throw new Error('邀请码已过期');
    }
    if (space.memberOpenids.length >= 2 && !space.memberOpenids.includes(OPENID)) {
      throw new Error('这个情侣空间已经满员');
    }

    if (!space.memberOpenids.includes(OPENID)) {
      await db.collection('spaces').doc(space._id).update({
        data: {
          memberOpenids: _.addToSet(OPENID),
          updatedAt: now
        }
      });
    }

    await db.collection('users').doc(user._id).update({
      data: {
        currentSpaceId: space._id,
        updatedAt: now
      }
    });

    return ok({ spaceId: space._id });
  } catch (error) {
    return fail(error.message || '加入空间失败', 'JOIN_SPACE_FAILED');
  }
};
```

Create `cloudfunctions/getCurrentSpace/index.js`:

```js
const cloud = require('wx-server-sdk');
const { ok, fail } = require('../common/response');
const { getUser, requireSpaceMember } = require('../common/auth');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async () => {
  const { OPENID } = cloud.getWXContext();

  try {
    const user = await getUser(OPENID);
    if (!user || !user.currentSpaceId) {
      return ok({ user, space: null });
    }

    const { space } = await requireSpaceMember(OPENID, user.currentSpaceId);
    return ok({ user, space });
  } catch (error) {
    return fail(error.message || '获取空间失败', 'GET_SPACE_FAILED');
  }
};
```

Create `cloudfunctions/refreshInviteCode/index.js`:

```js
const cloud = require('wx-server-sdk');
const { ok, fail } = require('../common/response');
const { requireSpaceMember } = require('../common/auth');
const { requireString } = require('../common/validators');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

function createInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

exports.main = async (event) => {
  const db = cloud.database();
  const { OPENID } = cloud.getWXContext();
  const now = new Date();

  try {
    const spaceId = requireString(event.spaceId, '空间ID');
    const { space } = await requireSpaceMember(OPENID, spaceId);

    if (space.ownerOpenid !== OPENID) {
      throw new Error('只有创建者可以刷新邀请码');
    }

    const inviteCode = createInviteCode();
    const inviteExpireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.collection('spaces').doc(spaceId).update({
      data: { inviteCode, inviteExpireAt, updatedAt: now }
    });

    return ok({ inviteCode, inviteExpireAt });
  } catch (error) {
    return fail(error.message || '刷新邀请码失败', 'REFRESH_INVITE_FAILED');
  }
};
```

- [ ] **Step 4: Commit**

```bash
git add cloudfunctions/login cloudfunctions/createSpace cloudfunctions/joinSpace cloudfunctions/getCurrentSpace cloudfunctions/refreshInviteCode
git commit -m "feat: add auth and space cloud functions"
```

---

### Task 5: Implement Place and Note Cloud Functions

**Files:**
- Create: `cloudfunctions/listPlaces/index.js`
- Create: `cloudfunctions/getPlaceDetail/index.js`
- Create: `cloudfunctions/createPlace/index.js`
- Create: `cloudfunctions/updatePlace/index.js`
- Create: `cloudfunctions/deletePlace/index.js`
- Create: `cloudfunctions/createNote/index.js`
- Create: `cloudfunctions/updateNote/index.js`
- Create: `cloudfunctions/deleteNote/index.js`

- [ ] **Step 1: Implement place listing and detail**

Create `listPlaces/index.js` with membership check, category filter, `deletedAt: null`, and `orderBy('visitDate', 'desc')`.

Create `getPlaceDetail/index.js` with membership check by loaded place `spaceId`, and query notes by `placeId` where `deletedAt: null`.

Expected response:

```js
ok({ places })
ok({ place, notes })
```

- [ ] **Step 2: Implement place mutations**

Create `createPlace/index.js`, `updatePlace/index.js`, and `deletePlace/index.js`.

Validation rules:

```js
const place = {
  name: requireString(event.name, '地点名称'),
  category: requireCategory(event.category),
  address: optionalString(event.address),
  latitude: requireNumber(event.latitude, '纬度'),
  longitude: requireNumber(event.longitude, '经度'),
  poiId: optionalString(event.poiId),
  visitDate: requireString(event.visitDate, '日期'),
  rating: Math.max(0, Math.min(5, Number(event.rating || 0))),
  content: optionalString(event.content),
  coverFileId: optionalString(event.coverFileId),
  photoFileIds: Array.isArray(event.photoFileIds) ? event.photoFileIds : []
};
```

Soft delete:

```js
await db.collection('places').doc(placeId).update({
  data: { deletedAt: new Date(), updatedAt: new Date() }
});
```

- [ ] **Step 3: Implement note mutations**

Create `createNote/index.js`, `updateNote/index.js`, and `deleteNote/index.js`.

Validation rules:

```js
const note = {
  text: optionalString(event.text),
  color: requireNoteColor(event.color || 'yellow'),
  photoFileId: optionalString(event.photoFileId)
};

if (!note.text && !note.photoFileId) {
  throw new Error('便利贴需要文字或照片');
}
```

Always load the parent place first and call `requireSpaceMember(OPENID, place.spaceId)`.

- [ ] **Step 4: Commit**

```bash
git add cloudfunctions/listPlaces cloudfunctions/getPlaceDetail cloudfunctions/createPlace cloudfunctions/updatePlace cloudfunctions/deletePlace cloudfunctions/createNote cloudfunctions/updateNote cloudfunctions/deleteNote
git commit -m "feat: add place and note cloud functions"
```

---

### Task 6: Implement Album, POI Search, and Export Cloud Functions

**Files:**
- Create: `cloudfunctions/getAlbum/index.js`
- Create: `cloudfunctions/searchPoi/index.js`
- Create: `cloudfunctions/exportData/index.js`

- [ ] **Step 1: Implement album aggregation**

`getAlbum` accepts `spaceId`, optional `category`, validates membership, lists non-deleted places, and returns flattened photos:

```js
{
  fileId,
  placeId: place._id,
  placeName: place.name,
  category: place.category,
  visitDate: place.visitDate
}
```

- [ ] **Step 2: Implement POI search**

`searchPoi` accepts `keyword`, `latitude`, `longitude`, `mapKey`, validates keyword, calls Tencent Location Service endpoint:

```text
https://apis.map.qq.com/ws/place/v1/search
```

Return normalized items:

```js
{
  id: item.id || '',
  title: item.title,
  address: item.address,
  latitude: item.location.lat,
  longitude: item.location.lng
}
```

- [ ] **Step 3: Implement export**

`exportData` accepts `spaceId`, validates membership, returns:

```js
ok({
  space,
  places,
  notes,
  exportedAt: new Date()
})
```

- [ ] **Step 4: Commit**

```bash
git add cloudfunctions/getAlbum cloudfunctions/searchPoi cloudfunctions/exportData
git commit -m "feat: add album poi and export cloud functions"
```

---

### Task 7: Implement Bootstrap and Space UI

**Files:**
- Create: `miniprogram/pages/bootstrap/index.json`
- Create: `miniprogram/pages/bootstrap/index.wxml`
- Create: `miniprogram/pages/bootstrap/index.wxss`
- Create: `miniprogram/pages/bootstrap/index.ts`
- Modify: `miniprogram/pages/profile/*`

- [ ] **Step 1: Build bootstrap page**

Bootstrap page behavior:

```ts
onLoad() {
  await callFunction('login');
  const { space } = await callFunction('getCurrentSpace');
  if (space) {
    wx.switchTab({ url: '/pages/map/index' });
  }
}
```

UI states:

- no space: show create and join panels.
- joining: show invite code input.
- loading: disable buttons.

- [ ] **Step 2: Build profile space section**

Profile page displays:

- space name
- member count
- invite code
- refresh invite button
- export data button

- [ ] **Step 3: Commit**

```bash
git add miniprogram/pages/bootstrap miniprogram/pages/profile
git commit -m "feat: add space onboarding ui"
```

---

### Task 8: Implement Map Home and Place List UI

**Files:**
- Create: `miniprogram/pages/map/index.json`
- Create: `miniprogram/pages/map/index.wxml`
- Create: `miniprogram/pages/map/index.wxss`
- Create: `miniprogram/pages/map/index.ts`
- Create: `miniprogram/components/place-card/*`
- Create: `miniprogram/components/empty-state/*`

- [ ] **Step 1: Build map page data loading**

Load current space and places:

```ts
const { space } = await callFunction<{ space: Space }>('getCurrentSpace');
const { places } = await callFunction<{ places: Place[] }>('listPlaces', {
  spaceId: space._id,
  category: this.data.category === 'all' ? '' : this.data.category
});
this.setData({ space, places, markers: places.map(toMarker) });
```

- [ ] **Step 2: Build category filter**

Filter values:

```ts
const categories = [
  { value: 'all', label: '全部' },
  { value: 'restaurant', label: '饭店' },
  { value: 'hotel', label: '酒店' },
  { value: 'scenic', label: '景点' },
  { value: 'other', label: '其他' }
];
```

- [ ] **Step 3: Build marker click and card navigation**

Marker click finds the selected place by marker id and shows bottom card. Card tap navigates to:

```text
/pages/place-detail/index?id=<placeId>
```

- [ ] **Step 4: Commit**

```bash
git add miniprogram/pages/map miniprogram/components/place-card miniprogram/components/empty-state
git commit -m "feat: add map home"
```

---

### Task 9: Implement Place Creation and Editing UI

**Files:**
- Create: `miniprogram/pages/place-form/index.json`
- Create: `miniprogram/pages/place-form/index.wxml`
- Create: `miniprogram/pages/place-form/index.wxss`
- Create: `miniprogram/pages/place-form/index.ts`
- Create: `miniprogram/pages/map-picker/index.*`
- Create: `miniprogram/pages/poi-search/index.*`

- [ ] **Step 1: Build place form state**

Form fields:

```ts
{
  id: '',
  name: '',
  category: 'restaurant',
  address: '',
  latitude: 0,
  longitude: 0,
  poiId: '',
  visitDate: today(),
  rating: 5,
  content: '',
  coverFileId: '',
  photoFileIds: []
}
```

- [ ] **Step 2: Build POI search page**

Search page calls:

```ts
await callFunction('searchPoi', {
  keyword: this.data.keyword,
  latitude: this.data.latitude,
  longitude: this.data.longitude,
  mapKey: TENCENT_MAP_KEY
});
```

If `TENCENT_MAP_KEY` is empty, show a warm prompt and route to manual map picker.

- [ ] **Step 3: Build map picker page**

Map picker uses current location by default and lets the user tap a point. Confirm returns selected coordinates through `eventChannel`.

- [ ] **Step 4: Build photo upload**

Use `chooseAndUploadImages(spaceId, remainingCount)` and set `coverFileId` to the first image when empty.

- [ ] **Step 5: Save form**

Create mode calls `createPlace`; edit mode calls `updatePlace`; success redirects to place detail.

- [ ] **Step 6: Commit**

```bash
git add miniprogram/pages/place-form miniprogram/pages/map-picker miniprogram/pages/poi-search
git commit -m "feat: add place form and location selection"
```

---

### Task 10: Implement Place Detail, Notes, and Photo Grid

**Files:**
- Create: `miniprogram/pages/place-detail/index.*`
- Create: `miniprogram/pages/note-form/index.*`
- Create: `miniprogram/components/photo-grid/*`
- Create: `miniprogram/components/sticky-note/*`

- [ ] **Step 1: Build detail loading**

Call:

```ts
const { place, notes } = await callFunction<{ place: Place; notes: Note[] }>('getPlaceDetail', {
  placeId: this.data.id
});
```

- [ ] **Step 2: Build photo preview**

Photo grid calls:

```ts
wx.previewImage({
  current: currentFileId,
  urls: fileIds
});
```

- [ ] **Step 3: Build note form**

Note form fields:

```ts
{
  placeId: '',
  text: '',
  color: 'yellow',
  photoFileId: ''
}
```

Save calls `createNote` or `updateNote`.

- [ ] **Step 4: Build soft delete actions**

Place delete calls `deletePlace`, then `wx.switchTab({ url: '/pages/map/index' })`.

Note delete calls `deleteNote`, then reloads detail.

- [ ] **Step 5: Commit**

```bash
git add miniprogram/pages/place-detail miniprogram/pages/note-form miniprogram/components/photo-grid miniprogram/components/sticky-note
git commit -m "feat: add place detail and notes"
```

---

### Task 11: Implement Album and Profile Pages

**Files:**
- Create: `miniprogram/pages/album/index.*`
- Complete: `miniprogram/pages/profile/index.*`

- [ ] **Step 1: Build album loading**

Call:

```ts
const { photos } = await callFunction<{ photos: AlbumPhoto[] }>('getAlbum', {
  spaceId: this.data.spaceId,
  category: this.data.category === 'all' ? '' : this.data.category
});
```

- [ ] **Step 2: Build album photo navigation**

Tapping photo navigates to:

```text
/pages/place-detail/index?id=<placeId>
```

- [ ] **Step 3: Complete profile page**

Profile page actions:

- refresh invite code
- copy invite code
- export data
- show setup reminders for CloudBase and Tencent Location Service

- [ ] **Step 4: Commit**

```bash
git add miniprogram/pages/album miniprogram/pages/profile
git commit -m "feat: add album and profile pages"
```

---

### Task 12: Add Cloud Database, Storage, and Release Docs

**Files:**
- Create: `README.md`
- Create: `docs/cloud-database.md`
- Create: `docs/cloud-storage.md`
- Create: `docs/tencent-location.md`
- Create: `docs/release-checklist.md`
- Create: `docs/test-checklist.md`

- [ ] **Step 1: Document database collections**

`docs/cloud-database.md` must list:

- `users`
- `spaces`
- `places`
- `notes`
- `checkins`
- `app_config`

It must state that core collections should deny direct client writes and use cloud functions.

- [ ] **Step 2: Document storage**

`docs/cloud-storage.md` must define:

```text
spaces/{spaceId}/photos/{timestamp}-{index}.{ext}
spaces/{spaceId}/notes/{timestamp}-{index}.{ext}
exports/{spaceId}/{timestamp}.json
```

- [ ] **Step 3: Document Tencent Location Service**

`docs/tencent-location.md` must include:

- create Tencent Location Service key
- enable WebService API
- configure legal request domains where needed
- set `TENCENT_MAP_KEY` in `miniprogram/env.ts`
- fallback behavior when key is empty

- [ ] **Step 4: Document release and testing**

`docs/release-checklist.md` must include:

- replace `appid`
- set CloudBase env id
- upload and deploy all cloud functions
- create database collections
- configure permissions
- test on WeChat DevTools
- test on real phone preview
- submit for review

`docs/test-checklist.md` must include every acceptance item from the spec.

- [ ] **Step 5: Commit**

```bash
git add README.md docs/cloud-database.md docs/cloud-storage.md docs/tencent-location.md docs/release-checklist.md docs/test-checklist.md
git commit -m "docs: add setup release and test docs"
```

---

### Task 13: Verification and Remote Push

**Files:**
- Modify only files that fail verification.

- [ ] **Step 1: Verify no unfinished markers remain**

Run:

```bash
rg -n "TO[D]O|TB[D]|待[定]|占[位]" miniprogram cloudfunctions README.md docs --glob '!docs/superpowers/**'
```

Expected: no matches in committed source or release docs.

- [ ] **Step 2: Verify git status**

Run:

```bash
git status --short
```

Expected: no output.

- [ ] **Step 3: Push**

Run:

```bash
git push
```

Expected: branch updates on `origin/main`.

---

## Self-Review

Spec coverage:

- Couple space and invite flow: Tasks 4 and 7.
- Map records and markers: Tasks 5 and 8.
- Place creation with POI and manual pick: Tasks 6 and 9.
- Place detail, photos, and sticky notes: Tasks 5 and 10.
- Album: Tasks 6 and 11.
- Permissions: Tasks 3, 4, 5, and 6.
- Release docs: Task 12.
- Verification: Task 13.

Unfinished marker scan:

- The plan intentionally keeps `CLOUD_ENV_ID`, `TENCENT_MAP_KEY`, and `appid` empty or tourist values because they must be configured by the developer's real WeChat and Tencent accounts before release.

Type consistency:

- `PlaceCategory`, `NoteColor`, `spaceId`, `placeId`, `photoFileIds`, and `deletedAt` match the approved spec.
