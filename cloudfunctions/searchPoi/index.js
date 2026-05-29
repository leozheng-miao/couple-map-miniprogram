const cloud = require('wx-server-sdk');
const { getOpenId } = require('./common/context');
const https = require('https');
const { ok, fail } = require('./common/response');
const { optionalString, requireNumber, requireString } = require('./common/validators');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

function requestJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let body = '';
      response.on('data', (chunk) => {
        body += chunk;
      });
      response.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

function inferCategory(title) {
  if (/酒店|宾馆|民宿|旅店/.test(title)) return 'hotel';
  if (/景区|公园|博物馆|山|湖|海|寺|园/.test(title)) return 'scenic';
  if (/影院|电影|剧院|KTV|密室|桌游|游乐|电玩城|酒吧|演出|娱乐/.test(title)) return 'entertainment';
  if (/纪念|婚礼|生日|节日|周年|求婚|特别|特殊/.test(title)) return 'special';
  if (/饭|餐|咖啡|火锅|烧烤|面|酒馆|茶/.test(title)) return 'restaurant';
  return 'other';
}

exports.main = async (event) => {
  try {
    const keyword = requireString(event.keyword, '搜索关键词');
    const latitude = requireNumber(event.latitude || 39.9042, '纬度');
    const longitude = requireNumber(event.longitude || 116.4074, '经度');
    const mapKey = optionalString(event.mapKey || process.env.TENCENT_MAP_KEY);

    if (!mapKey) {
      throw new Error('请先配置腾讯位置服务 Key');
    }

    const params = new URLSearchParams({
      keyword,
      boundary: `nearby(${latitude},${longitude},50000)`,
      page_size: '20',
      key: mapKey
    });
    const payload = await requestJson(`https://apis.map.qq.com/ws/place/v1/search?${params.toString()}`);

    if (payload.status !== 0) {
      throw new Error(payload.message || '地点搜索失败');
    }

    const pois = (payload.data || []).map((item) => ({
      id: item.id || '',
      title: item.title || '',
      address: item.address || '',
      latitude: item.location?.lat || 0,
      longitude: item.location?.lng || 0,
      distance: item._distance || 0,
      category: inferCategory(`${item.title || ''}${item.category || ''}`)
    }));

    return ok({ pois });
  } catch (error) {
    return fail(error.message || '搜索地点失败', 'SEARCH_POI_FAILED');
  }
};
