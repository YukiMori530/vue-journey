export interface GeoPoint {
  lng: number;
  lat: number;
}

export const MAX_CITY_STOP_KM = 20;
export const MAX_CLUSTER_JUMP_KM = 18;
export const MAX_REMOTE_LANDMARK_KM = 95;
export const MIN_STOP_SEPARATION_KM = 0.12;
export const MAX_URBAN_FROM_CENTER_KM = 45;
export const MAX_REMOTE_FROM_CENTER_KM = 120;
export const MIN_POI_NAME_SCORE = 4;

const WIDE_AREA_DEST_RE =
  /^(?:河北|河南|山东|山西|陕西|甘肃|云南|贵州|四川|广东|广西|湖南|湖北|江西|安徽|江苏|浙江|福建|辽宁|吉林|黑龙江|内蒙古|新疆|西藏|宁夏|青海|海南)$/;

const STOP_CITY_HINTS: Array<{ key: string; city: string }> = [
  { key: '北戴河', city: '秦皇岛' },
  { key: '山海关', city: '秦皇岛' },
  { key: '老龙头', city: '秦皇岛' },
  { key: '鸽子窝', city: '秦皇岛' },
  { key: '老虎石', city: '秦皇岛' },
  { key: '秦皇岛', city: '秦皇岛' },
  { key: '避暑山庄', city: '承德' },
  { key: '普宁寺', city: '承德' },
  { key: '普陀宗乘', city: '承德' },
  { key: '磬锤峰', city: '承德' },
  { key: '二仙居', city: '承德' },
  { key: '承德', city: '承德' },
  { key: '石家庄', city: '石家庄' },
  { key: '正定', city: '石家庄' },
  { key: '赵州桥', city: '石家庄' },
  { key: '野三坡', city: '保定' },
  { key: '白洋淀', city: '保定' },
  { key: '保定', city: '保定' },
  { key: '崇礼', city: '张家口' },
  { key: '张家口', city: '张家口' },
  { key: '唐山', city: '唐山' },
].sort((a, b) => b.key.length - a.key.length);

export function isWideAreaDestination(destination: string): boolean {
  const region = extractDestinationRegion(destination);
  return WIDE_AREA_DEST_RE.test(region) || /(?:省|自治区)$/.test(destination.trim());
}

export function extractDestinationRegion(destination: string): string {
  const trimmed = destination.trim();
  for (const province of [
    '河北', '河南', '山东', '山西', '陕西', '甘肃', '云南', '贵州', '四川',
    '广东', '广西', '湖南', '湖北', '江西', '安徽', '江苏', '浙江', '福建',
    '辽宁', '吉林', '黑龙江', '内蒙古', '新疆', '西藏', '宁夏', '青海', '海南',
  ]) {
    if (trimmed.startsWith(province)) {
      return province;
    }
  }
  return normalizeCityName(trimmed);
}

export function inferStopCity(name: string, destination: string): string {
  const primary = primaryPlaceName(name);
  for (const { key, city } of STOP_CITY_HINTS) {
    if (primary.includes(key)) {
      return normalizeCityName(city);
    }
  }
  return normalizeCityName(destination) || destination;
}

const CITY_DEFAULT_CENTER: Record<string, GeoPoint> = {
  北京: { lng: 116.397, lat: 39.903 },
  上海: { lng: 121.473, lat: 31.23 },
  成都: { lng: 104.066, lat: 30.572 },
  青岛: { lng: 120.382, lat: 36.067 },
  西安: { lng: 108.939, lat: 34.341 },
  杭州: { lng: 120.155, lat: 30.274 },
  河北: { lng: 114.514, lat: 38.042 },
  石家庄: { lng: 114.514, lat: 38.042 },
  承德: { lng: 117.939, lat: 40.976 },
  秦皇岛: { lng: 119.6, lat: 39.935 },
  南昌: { lng: 115.857, lat: 28.682 },
  三亚: { lng: 109.512, lat: 18.252 },
};

export function defaultCityCenter(city: string): GeoPoint {
  const region = extractDestinationRegion(city);
  return CITY_DEFAULT_CENTER[region] ?? CITY_DEFAULT_CENTER[normalizeCityName(city)] ?? {
    lng: 116.397,
    lat: 39.903,
  };
}

export function resolveStopGeoContext(
  stopName: string,
  destination: string,
  tripCityCenter: GeoPoint | null,
): { stopCity: string; center: GeoPoint | null } {
  const stopCity = inferStopCity(stopName, destination);
  const tripRegion = extractDestinationRegion(destination);
  if (stopCity !== tripRegion) {
    return { stopCity, center: defaultCityCenter(stopCity) };
  }
  return { stopCity, center: tripCityCenter ?? defaultCityCenter(stopCity) };
}

/** 实际在城外的经典一日游景点（不应被「同天聚类 18km」限制拉回市区） */
const REMOTE_EXCURSION_RE =
  /八达岭|慕田峪|居庸关|司马台|金山岭|古北口|十渡|明十三陵|十三陵|潭柘寺|红螺寺|青龙峡|古北水镇|雁栖湖|云蒙山|雾灵山|兵马俑|华清宫|乾陵|法门寺|阳关|玉门关|雅丹|魔鬼城|玉龙雪山|蓝月谷|泸沽湖|天门山|天子山|袁家界|武陵源|张家界国家森林公园|阳朔|十里画廊|蜈支洲岛|天涯海角|南山文化旅游区|后海村|亚龙湾|海棠湾|西岛|大东海|鹿回头|养马岛|蓬莱阁|华山|泰山|黄山|峨眉山|青城山|都江堰|千岛湖|赛里木湖|喀纳斯|禾木|那拉提|抚仙湖|抚仙|洱海双廊|双廊古镇|束河古镇|白沙古镇/;

/** 市区里的长城班车/上车点，容易误匹配 */
const POI_SHUTTLE_RE = /直通车|专线|乘车点|上车点|发车点|旅游集散|集散中心/;

/** 非景点：不应出现在地图上的交通设施等 */
const NON_ATTRACTION_RE =
  /(?:火车|高铁|动车)?站$|机场|航站楼|地铁站$|地铁口|停车场|出入口|检票口|游客中心$/;

/** 全国唯一、可跨城市直接匹配的地标 */
const GLOBAL_LANDMARKS: Record<string, GeoPoint> = {
  八达岭长城: { lng: 116.0167, lat: 40.3592 },
  八达岭: { lng: 116.0167, lat: 40.3592 },
  慕田峪长城: { lng: 116.5704, lat: 40.4317 },
  居庸关长城: { lng: 116.0726, lat: 40.2919 },
  故宫博物院: { lng: 116.397, lat: 39.918 },
  秦始皇兵马俑博物馆: { lng: 109.273, lat: 34.384 },
  兵马俑: { lng: 109.273, lat: 34.384 },
};

/** 易重名，必须结合 destination 匹配 */
const CITY_LANDMARKS: Record<string, Record<string, GeoPoint>> = {
  北京: {
    天安门广场: { lng: 116.3975, lat: 39.9032 },
    前门大街: { lng: 116.3972, lat: 39.8953 },
    颐和园: { lng: 116.275, lat: 39.999 },
    圆明园: { lng: 116.301, lat: 40.008 },
    清华大学: { lng: 116.326, lat: 40.003 },
    什刹海: { lng: 116.386, lat: 39.941 },
    南锣鼓巷: { lng: 116.403, lat: 39.936 },
    簋街: { lng: 116.416, lat: 39.941 },
    牛街: { lng: 116.363, lat: 39.886 },
    景山公园: { lng: 116.397, lat: 39.925 },
    北京站: { lng: 116.427, lat: 39.903 },
    北京北站: { lng: 116.352, lat: 39.944 },
    北京西站: { lng: 116.322, lat: 39.894 },
    北京南站: { lng: 116.378, lat: 39.865 },
  },
  青岛: {
    青岛啤酒博物馆: { lng: 120.347, lat: 36.088 },
    台东步行街: { lng: 120.355, lat: 36.087 },
    栈桥: { lng: 120.319, lat: 36.064 },
    奥帆中心: { lng: 120.395, lat: 36.06 },
    八大关风景区: { lng: 120.343, lat: 36.053 },
    劈柴院: { lng: 120.326, lat: 36.067 },
  },
  成都: {
    宽窄巷子: { lng: 104.055, lat: 30.669 },
    锦里: { lng: 104.049, lat: 30.645 },
    春熙路: { lng: 104.081, lat: 30.657 },
    武侯祠: { lng: 104.048, lat: 30.647 },
  },
  西安: {
    钟楼: { lng: 108.945, lat: 34.259 },
    回民街: { lng: 108.944, lat: 34.262 },
    大雁塔: { lng: 108.964, lat: 34.218 },
    陕西历史博物馆: { lng: 108.955, lat: 34.224 },
  },
  杭州: {
    西湖: { lng: 120.148, lat: 30.242 },
    灵隐寺: { lng: 120.101, lat: 30.242 },
    河坊街: { lng: 120.169, lat: 30.241 },
  },
  上海: {
    新天地: { lng: 121.475, lat: 31.22 },
    豫园: { lng: 121.492, lat: 31.227 },
    城隍庙: { lng: 121.493, lat: 31.224 },
    外滩: { lng: 121.49, lat: 31.24 },
    南京路步行街: { lng: 121.475, lat: 31.234 },
    武康路: { lng: 121.437, lat: 31.209 },
    田子坊: { lng: 121.468, lat: 31.21 },
    东方明珠: { lng: 121.495, lat: 31.24 },
    陆家嘴: { lng: 121.503, lat: 31.239 },
    静安寺: { lng: 121.447, lat: 31.224 },
    迪士尼: { lng: 121.667, lat: 31.144 },
  },
  南昌: {
    八一广场: { lng: 115.905, lat: 28.674 },
    万寿宫: { lng: 115.889, lat: 28.676 },
    大士院: { lng: 115.892, lat: 28.678 },
    珠宝街: { lng: 115.89, lat: 28.675 },
    滕王阁: { lng: 115.879, lat: 28.675 },
    南昌之星: { lng: 115.876, lat: 28.653 },
    艾溪湖: { lng: 115.965, lat: 28.697 },
    秋水广场: { lng: 115.877, lat: 28.689 },
  },
  承德: {
    避暑山庄: { lng: 117.937, lat: 40.989 },
    普宁寺: { lng: 117.934, lat: 41.011 },
    二仙居: { lng: 117.939, lat: 40.976 },
    普陀宗乘之庙: { lng: 117.946, lat: 41.018 },
    磬锤峰: { lng: 117.915, lat: 40.968 },
  },
  秦皇岛: {
    山海关: { lng: 119.765, lat: 40.01 },
    老龙头: { lng: 119.844, lat: 39.966 },
    鸽子窝公园: { lng: 119.46, lat: 39.842 },
    鸽子窝: { lng: 119.46, lat: 39.842 },
    老虎石: { lng: 119.455, lat: 39.825 },
    北戴河: { lng: 119.484, lat: 39.834 },
    秦皇岛站: { lng: 119.601, lat: 39.965 },
    北戴河站: { lng: 119.424, lat: 39.866 },
    刘庄: { lng: 119.476, lat: 39.828 },
    阿那亚: { lng: 119.316, lat: 39.667 },
    秦皇求仙入海处: { lng: 119.524, lat: 39.924 },
    求仙入海: { lng: 119.524, lat: 39.924 },
    石塘路市场: { lng: 119.598, lat: 39.928 },
    石塘路海鲜市场: { lng: 119.598, lat: 39.928 },
  },
  石家庄: {
    赵州桥: { lng: 114.776, lat: 37.718 },
    正定古城: { lng: 114.569, lat: 38.144 },
  },
  敦煌: {
    莫高窟: { lng: 94.809, lat: 40.042 },
    鸣沙山月牙泉: { lng: 94.668, lat: 40.089 },
    鸣沙山: { lng: 94.668, lat: 40.089 },
    阳关景区: { lng: 94.058, lat: 39.931 },
    玉门关: { lng: 93.865, lat: 40.353 },
  },
  丽江: {
    大研古城: { lng: 100.234, lat: 26.872 },
    玉龙雪山: { lng: 100.258, lat: 27.098 },
  },
  三亚: {
    亚龙湾: { lng: 109.645, lat: 18.233 },
    亚龙湾海滩: { lng: 109.645, lat: 18.233 },
    亚龙湾热带天堂森林公园: { lng: 109.64, lat: 18.256 },
    天涯海角: { lng: 109.35, lat: 18.3 },
    蜈支洲岛: { lng: 109.766, lat: 18.312 },
    后海村: { lng: 109.742, lat: 18.318 },
    南山文化旅游区: { lng: 109.214, lat: 18.172 },
    南山寺: { lng: 109.214, lat: 18.172 },
    鹿回头: { lng: 109.501, lat: 18.225 },
    鹿回头公园: { lng: 109.501, lat: 18.225 },
    第一市场: { lng: 109.508, lat: 18.247 },
    大东海: { lng: 109.525, lat: 18.222 },
    西岛: { lng: 109.366, lat: 18.225 },
  },
};

export function normalizeCityName(city: string): string {
  return city.replace(/(市|县|区|自治州|地区|盟)$/, '').trim();
}

export function primaryPlaceName(name: string): string {
  return name
    .split(/[/|、·]/)[0]
    .replace(/[（(].*?[）)]/g, '')
    .trim();
}

function landmarkMatches(primary: string, key: string): boolean {
  if (primary === key || primary.includes(key)) {
    return true;
  }
  return primary.length >= 3 && key.includes(primary);
}

function lookupInTable(
  table: Record<string, GeoPoint>,
  primary: string,
): GeoPoint | null {
  const entries = Object.entries(table).sort(([a], [b]) => b.length - a.length);
  for (const [key, point] of entries) {
    if (landmarkMatches(primary, key)) {
      return point;
    }
  }
  return null;
}

export function lookupKnownLandmark(name: string, city?: string): GeoPoint | null {
  const citiesToTry = new Set<string>();
  if (city) {
    citiesToTry.add(extractDestinationRegion(city));
    citiesToTry.add(inferStopCity(name, city));
  }

  for (const alias of landmarkSearchAliases(name, city)) {
    for (const tryCity of citiesToTry) {
      if (tryCity && CITY_LANDMARKS[tryCity]) {
        const cityMatch = lookupInTable(CITY_LANDMARKS[tryCity], alias);
        if (cityMatch) {
          return cityMatch;
        }
      }
    }

    const globalMatch = lookupInTable(GLOBAL_LANDMARKS, alias);
    if (globalMatch) {
      return globalMatch;
    }
  }

  return null;
}

/** 某城市已知地标列表，用于无法定位时的兜底 */
export function knownLandmarkStops(
  city: string,
): Array<{ name: string; lng: number; lat: number }> {
  const region = extractDestinationRegion(city);
  const normalized = normalizeCityName(city);
  const table =
    CITY_LANDMARKS[normalized] ?? CITY_LANDMARKS[region] ?? null;
  if (!table) {
    return [];
  }
  return Object.entries(table).map(([name, point]) => ({ name, ...point }));
}

/** AI 易生成的泛称，高德难以稳定检索 */
export function isVaguePlaceName(name: string): boolean {
  const primary = primaryPlaceName(name).replace(/\s/g, '');
  if (/(?:当地|本地|特色|知名|网红|必吃|人气)(?:美食|小吃|餐厅|海鲜|大排档|打卡)/.test(primary)) {
    return true;
  }
  if (/^[\u4e00-\u9fa5]{2,10}(?:市|区|县)[\u4e00-\u9fa5]{0,6}(?:海鲜市场|农贸市场|菜市场|美食城)$/.test(primary)) {
    return true;
  }
  if (/^[\u4e00-\u9fa5]{2,8}区海鲜市场$/.test(primary)) {
    return true;
  }
  if (/附近(?:美食|餐厅|小吃|海鲜)/.test(primary)) {
    return true;
  }
  return false;
}

export function landmarkSearchAliases(name: string, city?: string): string[] {
  const cityName = city ? normalizeCityName(city) : '';
  const primary = primaryPlaceName(name);
  const stripped = primary.replace(new RegExp(`^${cityName}`), '').trim();
  const aliases = [primary, stripped, name];

  if (/小吃/.test(stripped)) {
    const base = stripped.replace(/小吃.*$/, '').replace(/街$/, '').trim();
    if (base) aliases.push(base);
  }
  if (/历史文化街区|历史街区|文化街区/.test(stripped)) {
    aliases.push(stripped.replace(/历史文化街区|历史街区|文化街区/, '').trim());
  }
  if (/湿地/.test(stripped)) {
    aliases.push(stripped.replace(/公园.*$/, '').trim());
  }
  if (/后海/.test(stripped) && cityName === '三亚') {
    aliases.push('海棠湾后海村', '三亚后海村');
  }

  return [...new Set(aliases.filter((item) => item.length >= 2))];
}

export function isRemoteExcursion(name: string): boolean {
  return REMOTE_EXCURSION_RE.test(primaryPlaceName(name));
}

export function isShuttlePoi(poiName: string): boolean {
  return POI_SHUTTLE_RE.test(poiName.replace(/\s/g, ''));
}

export function isNonAttractionStop(name: string): boolean {
  const primary = primaryPlaceName(name).replace(/\s/g, '');
  if (!NON_ATTRACTION_RE.test(primary)) {
    return false;
  }
  return !/(古城|广场|公园|景区|博物馆|寺|街|巷|楼|塔|山|海|湖|岛|市场|步行街)/.test(
    primary,
  );
}

export function isNonAttractionPoi(poiName: string): boolean {
  return isNonAttractionStop(poiName);
}

export function shouldBindToCluster(stopName: string): boolean {
  return !isRemoteExcursion(stopName);
}

export function shouldAddToUrbanCluster(stopName: string): boolean {
  return shouldBindToCluster(stopName);
}

export function isWithinDestination(
  point: GeoPoint,
  cityCenter: GeoPoint | null,
  stopName: string,
  destination?: string,
): boolean {
  const center = destination
    ? resolveStopGeoContext(stopName, destination, cityCenter).center
    : cityCenter;
  if (!center) {
    return true;
  }
  const maxKm = isRemoteExcursion(stopName)
    ? MAX_REMOTE_FROM_CENTER_KM
    : MAX_URBAN_FROM_CENTER_KM;
  return distanceKm(center, point) <= maxKm;
}

export function isRemoteStopPoint(
  stopName: string,
  point: GeoPoint,
  cityCenter: GeoPoint | null,
  destination?: string,
): boolean {
  if (isRemoteExcursion(stopName)) {
    return true;
  }
  const center = destination
    ? resolveStopGeoContext(stopName, destination, cityCenter).center
    : cityCenter;
  if (!center) {
    return false;
  }
  return distanceKm(center, point) > 35;
}

export function isCoordPlausibleForStop(
  point: GeoPoint,
  anchor: GeoPoint | null,
  stopName: string,
): boolean {
  if (!anchor) {
    return true;
  }
  const maxKm = isRemoteExcursion(stopName)
    ? MAX_REMOTE_LANDMARK_KM
    : MAX_CITY_STOP_KM;
  return distanceKm(anchor, point) <= maxKm;
}

const RAILWAY_STATIONS = [
  '北京北站',
  '北京站',
  '北京西站',
  '北京南站',
  '北京东站',
  '上海虹桥站',
  '上海站',
];

function scoreRailwayStationMatch(poiName: string, keyword: string): number {
  const normalizedPoi = poiName.replace(/\s/g, '');
  const primary = primaryPlaceName(keyword).replace(/\s/g, '');

  for (const station of RAILWAY_STATIONS) {
    if (!primary.includes(station)) {
      continue;
    }
    if (normalizedPoi.includes(station)) {
      return 30;
    }
    if (/站/.test(normalizedPoi)) {
      return -60;
    }
  }

  return 0;
}

function poiKeywordTokens(keyword: string): string[] {
  const primary = primaryPlaceName(keyword).replace(/[（(].*?[）)]/g, '').trim();
  const tokens = new Set<string>([
    keyword.replace(/\s/g, ''),
    primary,
    ...keyword.split(/[/|、·]/).map((part) => part.trim()),
  ]);

  for (const base of [primary, keyword.replace(/\s/g, '')]) {
    tokens.add(base.replace(/^[\u4e00-\u9fa5]{2,8}市?/, '').trim());
    tokens.add(
      base.replace(/^[\u4e00-\u9fa5]{2,8}市?[\u4e00-\u9fa5]{0,6}区/, '').trim(),
    );
  }

  if (/海鲜市场/.test(primary)) {
    tokens.add('海鲜市场');
  }
  if (/求仙|入海/.test(primary)) {
    tokens.add('秦皇求仙入海处');
    tokens.add('求仙入海');
  }
  if (/小吃/.test(primary)) {
    const base = primary.replace(/小吃.*$/, '').replace(/街$/, '').trim();
    if (base) {
      tokens.add(base);
    }
  }

  return [...tokens].filter((token) => token.length >= 2);
}

export function poiNameScore(poiName: string, keyword: string): number {
  const normalizedPoi = poiName.replace(/\s/g, '');
  const tokens = poiKeywordTokens(keyword);

  let score = scoreRailwayStationMatch(poiName, keyword);
  for (const token of tokens) {
    if (normalizedPoi.includes(token)) {
      score += token.length;
    } else if (token.length >= 4 && token.includes(normalizedPoi)) {
      score += normalizedPoi.length;
    }
  }

  if (isShuttlePoi(poiName) || isNonAttractionPoi(poiName)) {
    score -= 30;
  }

  if (isRemoteExcursion(keyword)) {
    if (/景区|风景名胜|世界遗产|国家公园/.test(normalizedPoi)) {
      score += 10;
    }
    if (isShuttlePoi(poiName)) {
      score -= 20;
    }
  }

  return score;
}

export function isCoordTooCloseToAny(
  point: GeoPoint,
  anchors: GeoPoint[],
  minKm = MIN_STOP_SEPARATION_KM,
): boolean {
  return anchors.some((anchor) => distanceKm(anchor, point) < minKm);
}

export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function isCoordPlausible(
  point: GeoPoint,
  anchor: GeoPoint | null,
): boolean {
  if (!anchor) {
    return true;
  }
  return distanceKm(anchor, point) <= MAX_CITY_STOP_KM;
}

export function isCoordNearCluster(
  point: GeoPoint,
  anchors: GeoPoint[],
): boolean {
  if (!anchors.length) {
    return true;
  }
  return anchors.some((anchor) => distanceKm(anchor, point) <= MAX_CLUSTER_JUMP_KM);
}

export function pickClosestPoint(
  points: GeoPoint[],
  anchor: GeoPoint,
): GeoPoint | null {
  if (!points.length) {
    return null;
  }
  return [...points].sort(
    (a, b) => distanceKm(anchor, a) - distanceKm(anchor, b),
  )[0];
}

export function fallbackCoordsNear(
  anchor: GeoPoint,
  stopIndex: number,
): GeoPoint {
  const angle = stopIndex * 1.047;
  const radius = 0.004 + (stopIndex % 3) * 0.002;
  return {
    lng: anchor.lng + Math.cos(angle) * radius,
    lat: anchor.lat + Math.sin(angle) * radius * 0.6,
  };
}

export function buildPlaceQueries(name: string, city: string): string[] {
  const cityName = normalizeCityName(city) || city;
  const primary = primaryPlaceName(name);
  const stripped = primary.replace(new RegExp(`^${cityName}`), '').trim();
  const withCity = primary.includes(cityName) ? primary : `${cityName}市${primary}`;

  const queries = [
    primary,
    name,
    withCity,
    stripped !== primary ? `${cityName}市${stripped}` : '',
    stripped !== primary ? `${cityName}${stripped}` : '',
    stripped.includes('啤酒') ? `${cityName}市啤酒博物馆` : '',
    stripped.includes('奥帆') ? `${cityName}奥帆中心` : '',
    stripped.includes('路') && cityName !== '上海'
      ? `${cityName}市市南区${stripped}`
      : '',
    stripped.includes('路') ? `${cityName}市${stripped}` : '',
    stripped,
  ];

  if (/城隍庙|城隍/.test(stripped)) {
    queries.push(`${cityName}城隍庙`, `${cityName}市城隍庙`);
  }
  if (/豫园/.test(stripped)) {
    queries.push(`${cityName}豫园`, `${cityName}市豫园`, '豫园');
  }
  if (/新天地/.test(stripped)) {
    queries.push(`${cityName}新天地`, `${cityName}市新天地`);
  }
  if (/小吃/.test(stripped)) {
    const base = stripped.replace(/小吃.*$/, '').replace(/街$/, '').trim();
    if (base) {
      queries.push(`${cityName}${base}`, `${cityName}市${base}`, base);
    }
  }
  if (/湿地/.test(stripped)) {
    queries.push(`${cityName}${stripped}`, stripped.replace(/公园.*$/, ''));
  }
  if (/摩天轮|珠宝街|万寿宫|大士院/.test(stripped)) {
    queries.push(`${cityName}${stripped}`, stripped);
  }
  if (/求仙|入海/.test(stripped)) {
    queries.push('秦皇求仙入海处', `${cityName}秦皇求仙入海处`, `${cityName}求仙入海`);
  }
  if (/海鲜市场/.test(stripped)) {
    queries.push(`${cityName}海鲜市场`, '海鲜市场', stripped);
  }
  if (/后海/.test(stripped) && cityName === '三亚') {
    queries.push(
      `${cityName}后海村`,
      '海棠湾后海村',
      `${cityName}海棠湾后海村`,
      '后海渔村',
    );
  }

  if (/长城|八达岭|慕田峪|居庸关|兵马俑|雅丹|玉龙雪山|阳朔/.test(stripped)) {
    queries.push(`${stripped}景区`, `${stripped}风景名胜区`);
  }

  return [...new Set(queries.filter(Boolean))];
}
