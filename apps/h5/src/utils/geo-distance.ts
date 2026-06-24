export interface GeoPoint {
  lng: number
  lat: number
}

export const MAX_CITY_STOP_KM = 20
export const MAX_CLUSTER_JUMP_KM = 18
export const MAX_REMOTE_LANDMARK_KM = 95
export const MIN_STOP_SEPARATION_KM = 0.12
export const MAX_URBAN_FROM_CENTER_KM = 45
export const MAX_REMOTE_FROM_CENTER_KM = 120
export const MIN_POI_NAME_SCORE = 4

const REMOTE_EXCURSION_RE =
  /八达岭|慕田峪|居庸关|司马台|金山岭|古北口|十渡|明十三陵|十三陵|潭柘寺|红螺寺|青龙峡|古北水镇|雁栖湖|云蒙山|雾灵山|兵马俑|华清宫|乾陵|法门寺|阳关|玉门关|雅丹|魔鬼城|玉龙雪山|蓝月谷|泸沽湖|天门山|天子山|袁家界|武陵源|张家界国家森林公园|阳朔|十里画廊|蜈支洲岛|天涯海角|南山文化旅游区|养马岛|蓬莱阁|华山|泰山|黄山|峨眉山|青城山|都江堰|千岛湖|赛里木湖|喀纳斯|禾木|那拉提|抚仙湖|抚仙|洱海双廊|双廊古镇|束河古镇|白沙古镇/

const POI_SHUTTLE_RE = /直通车|专线|乘车点|上车点|发车点|旅游集散|集散中心/

const NON_ATTRACTION_RE =
  /(?:火车|高铁|动车)?站$|机场|航站楼|地铁站$|地铁口|停车场|出入口|检票口|游客中心$/

const GLOBAL_LANDMARKS: Record<string, GeoPoint> = {
  八达岭长城: { lng: 116.0167, lat: 40.3592 },
  八达岭: { lng: 116.0167, lat: 40.3592 },
  慕田峪长城: { lng: 116.5704, lat: 40.4317 },
  居庸关长城: { lng: 116.0726, lat: 40.2919 },
  故宫博物院: { lng: 116.397, lat: 39.918 },
  秦始皇兵马俑博物馆: { lng: 109.273, lat: 34.384 },
  兵马俑: { lng: 109.273, lat: 34.384 },
}

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
}

export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

export function normalizeCityName(city: string): string {
  return city.replace(/(市|县|区|自治州|地区|盟)$/, '').trim()
}

export function primaryPlaceName(name: string): string {
  return name
    .split(/[/|、·]/)[0]
    .replace(/[（(].*?[）)]/g, '')
    .trim()
}

function landmarkMatches(primary: string, key: string): boolean {
  if (primary === key || primary.includes(key)) {
    return true
  }
  return primary.length >= 3 && key.includes(primary)
}

function lookupInTable(
  table: Record<string, GeoPoint>,
  primary: string,
): GeoPoint | null {
  const entries = Object.entries(table).sort(([a], [b]) => b.length - a.length)
  for (const [key, point] of entries) {
    if (landmarkMatches(primary, key)) {
      return point
    }
  }
  return null
}

export function lookupKnownLandmark(name: string, city?: string): GeoPoint | null {
  const primary = primaryPlaceName(name)
  const cityName = city ? normalizeCityName(city) : ''

  if (cityName && CITY_LANDMARKS[cityName]) {
    const cityMatch = lookupInTable(CITY_LANDMARKS[cityName], primary)
    if (cityMatch) {
      return cityMatch
    }
  }

  return lookupInTable(GLOBAL_LANDMARKS, primary)
}

export function isRemoteExcursion(name: string): boolean {
  return REMOTE_EXCURSION_RE.test(primaryPlaceName(name))
}

export function isShuttlePoi(poiName: string): boolean {
  return POI_SHUTTLE_RE.test(poiName.replace(/\s/g, ''))
}

export function isNonAttractionStop(name: string): boolean {
  const primary = primaryPlaceName(name).replace(/\s/g, '')
  if (!NON_ATTRACTION_RE.test(primary)) {
    return false
  }
  return !/(古城|广场|公园|景区|博物馆|寺|街|巷|楼|塔|山|海|湖|岛|市场|步行街)/.test(
    primary,
  )
}

export function isNonAttractionPoi(poiName: string): boolean {
  return isNonAttractionStop(poiName)
}

export function shouldBindToCluster(stopName: string): boolean {
  return !isRemoteExcursion(stopName)
}

export function shouldAddToUrbanCluster(stopName: string): boolean {
  return shouldBindToCluster(stopName)
}

export function isWithinDestination(
  point: GeoPoint,
  cityCenter: GeoPoint | null,
  stopName: string,
): boolean {
  if (!cityCenter) {
    return true
  }
  const maxKm = isRemoteExcursion(stopName)
    ? MAX_REMOTE_FROM_CENTER_KM
    : MAX_URBAN_FROM_CENTER_KM
  return distanceKm(cityCenter, point) <= maxKm
}

export function isRemoteStopPoint(
  stopName: string,
  point: GeoPoint,
  cityCenter: GeoPoint | null,
): boolean {
  if (isRemoteExcursion(stopName)) {
    return true
  }
  if (!cityCenter) {
    return false
  }
  return distanceKm(cityCenter, point) > 35
}

export function isCoordPlausibleForStop(
  point: GeoPoint,
  anchor: GeoPoint | null,
  stopName: string,
): boolean {
  if (!anchor) {
    return true
  }
  const maxKm = isRemoteExcursion(stopName)
    ? MAX_REMOTE_LANDMARK_KM
    : MAX_CITY_STOP_KM
  return distanceKm(anchor, point) <= maxKm
}

const RAILWAY_STATIONS = [
  '北京北站',
  '北京站',
  '北京西站',
  '北京南站',
  '北京东站',
  '上海虹桥站',
  '上海站',
]

function scoreRailwayStationMatch(poiName: string, keyword: string): number {
  const normalizedPoi = poiName.replace(/\s/g, '')
  const primary = primaryPlaceName(keyword).replace(/\s/g, '')

  for (const station of RAILWAY_STATIONS) {
    if (!primary.includes(station)) {
      continue
    }
    if (normalizedPoi.includes(station)) {
      return 30
    }
    if (/站/.test(normalizedPoi)) {
      return -60
    }
  }

  return 0
}

export function poiNameScore(poiName: string, keyword: string): number {
  const normalizedPoi = poiName.replace(/\s/g, '')
  const tokens = [
    keyword,
    primaryPlaceName(keyword),
    ...keyword.split(/[/|、·]/),
  ]
    .map((token) => token.replace(/[（(].*?[）)]/g, '').trim())
    .filter((token) => token.length >= 2)

  let score = scoreRailwayStationMatch(poiName, keyword)
  for (const token of tokens) {
    if (normalizedPoi.includes(token)) {
      score += token.length
    }
  }

  if (isShuttlePoi(poiName) || isNonAttractionPoi(poiName)) {
    score -= 30
  }

  if (isRemoteExcursion(keyword)) {
    if (/景区|风景名胜|世界遗产|国家公园/.test(normalizedPoi)) {
      score += 10
    }
    if (isShuttlePoi(poiName)) {
      score -= 20
    }
  }

  return score
}

export function isCoordTooCloseToAny(
  point: GeoPoint,
  anchors: GeoPoint[],
  minKm = MIN_STOP_SEPARATION_KM,
): boolean {
  return anchors.some((anchor) => distanceKm(anchor, point) < minKm)
}

export function isCoordPlausible(point: GeoPoint, anchor: GeoPoint | null): boolean {
  if (!anchor) {
    return true
  }
  return distanceKm(anchor, point) <= MAX_CITY_STOP_KM
}

export function isCoordNearCluster(
  point: GeoPoint,
  anchors: GeoPoint[],
): boolean {
  if (!anchors.length) {
    return true
  }
  return anchors.some((anchor) => distanceKm(anchor, point) <= MAX_CLUSTER_JUMP_KM)
}

export function pickClosestPoint(
  points: GeoPoint[],
  anchor: GeoPoint,
): GeoPoint | null {
  if (!points.length) {
    return null
  }
  return [...points].sort(
    (a, b) => distanceKm(anchor, a) - distanceKm(anchor, b),
  )[0]
}

export function fallbackCoordsNear(
  anchor: GeoPoint,
  stopIndex: number,
): GeoPoint {
  const angle = stopIndex * 1.047
  const radius = 0.004 + (stopIndex % 3) * 0.002
  return {
    lng: anchor.lng + Math.cos(angle) * radius,
    lat: anchor.lat + Math.sin(angle) * radius * 0.6,
  }
}

export function buildPlaceQueries(name: string, city: string): string[] {
  const cityName = normalizeCityName(city) || city
  const primary = primaryPlaceName(name)
  const stripped = primary.replace(new RegExp(`^${cityName}`), '').trim()
  const withCity = primary.includes(cityName) ? primary : `${cityName}市${primary}`

  const queries = [
    primary,
    name,
    withCity,
    stripped !== primary ? `${cityName}市${stripped}` : '',
    stripped !== primary ? `${cityName}${stripped}` : '',
    stripped.includes('啤酒') ? `${cityName}市啤酒博物馆` : '',
    stripped.includes('奥帆') ? `${cityName}奥帆中心` : '',
    stripped.includes('路') ? `${cityName}市市南区${stripped}` : '',
    stripped,
  ]

  if (/长城|八达岭|慕田峪|居庸关|兵马俑|雅丹|玉龙雪山|阳朔/.test(stripped)) {
    queries.push(`${stripped}景区`, `${stripped}风景名胜区`)
  }

  return [...new Set(queries.filter(Boolean))]
}

/** 无坐标时的地图默认中心（不依赖网络） */
const CITY_DEFAULT_CENTER: Record<string, GeoPoint> = {
  北京: { lng: 116.397, lat: 39.903 },
  上海: { lng: 121.473, lat: 31.23 },
  成都: { lng: 104.066, lat: 30.572 },
  青岛: { lng: 120.382, lat: 36.067 },
  烟台: { lng: 121.448, lat: 37.463 },
  西安: { lng: 108.939, lat: 34.341 },
  杭州: { lng: 120.155, lat: 30.274 },
  敦煌: { lng: 94.662, lat: 40.142 },
}

export function defaultCityCenter(city: string): GeoPoint {
  const name = normalizeCityName(city)
  return CITY_DEFAULT_CENTER[name] ?? { lng: 116.397, lat: 39.903 }
}
