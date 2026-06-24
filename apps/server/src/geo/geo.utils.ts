export interface GeoPoint {
  lng: number;
  lat: number;
}

export const MAX_CITY_STOP_KM = 20;
export const MAX_CLUSTER_JUMP_KM = 18;
export const MAX_REMOTE_LANDMARK_KM = 95;
export const MIN_STOP_SEPARATION_KM = 0.12;

/** 实际在城外的经典一日游景点（不应被「同天聚类 18km」限制拉回市区） */
const REMOTE_EXCURSION_RE =
  /八达岭|慕田峪|居庸关|司马台|金山岭|古北口|十渡|明十三陵|十三陵|潭柘寺|红螺寺|青龙峡|古北水镇|雁栖湖|云蒙山|雾灵山/;

/** 市区里的长城班车/上车点，容易误匹配 */
const POI_SHUTTLE_RE = /直通车|专线|乘车点|上车点|发车点|旅游集散|集散中心/;

const KNOWN_LANDMARKS: Record<string, GeoPoint> = {
  八达岭长城: { lng: 116.0167, lat: 40.3592 },
  八达岭: { lng: 116.0167, lat: 40.3592 },
  慕田峪长城: { lng: 116.5704, lat: 40.4317 },
  居庸关长城: { lng: 116.0726, lat: 40.2919 },
  天安门广场: { lng: 116.3975, lat: 39.9032 },
  前门大街: { lng: 116.3972, lat: 39.8953 },
};

export function primaryPlaceName(name: string): string {
  return name
    .split(/[/|、·]/)[0]
    .replace(/[（(].*?[）)]/g, '')
    .trim();
}

export function isRemoteExcursion(name: string): boolean {
  return REMOTE_EXCURSION_RE.test(primaryPlaceName(name));
}

export function isShuttlePoi(poiName: string): boolean {
  return POI_SHUTTLE_RE.test(poiName.replace(/\s/g, ''));
}

export function lookupKnownLandmark(name: string): GeoPoint | null {
  const primary = primaryPlaceName(name);
  for (const [key, point] of Object.entries(KNOWN_LANDMARKS)) {
    if (primary.includes(key) || key.includes(primary)) {
      return point;
    }
  }
  return null;
}

export function shouldBindToCluster(stopName: string): boolean {
  return !isRemoteExcursion(stopName);
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

export function poiNameScore(poiName: string, keyword: string): number {
  const normalizedPoi = poiName.replace(/\s/g, '');
  const tokens = [
    keyword,
    primaryPlaceName(keyword),
    ...keyword.split(/[/|、·]/),
  ]
    .map((token) => token.replace(/[（(].*?[）)]/g, '').trim())
    .filter((token) => token.length >= 2);

  let score = 0;
  for (const token of tokens) {
    if (normalizedPoi.includes(token)) {
      score += token.length;
    }
  }

  if (isShuttlePoi(poiName)) {
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
  const cityName = city.replace(/(市|县|区)$/, '') || city;
  const primary = primaryPlaceName(name);
  const stripped = primary
    .replace(new RegExp(`^${cityName}`), '')
    .trim();
  const withCity = primary.includes(cityName) ? primary : `${cityName}市${primary}`;

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
  ];

  if (/长城|八达岭|慕田峪|居庸关/.test(stripped)) {
    queries.push(`${stripped}景区`, `${stripped}风景名胜区`);
  }

  return [...new Set(queries.filter(Boolean))];
}
