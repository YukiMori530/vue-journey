export interface GeoPoint {
  lng: number;
  lat: number;
}

export const MAX_CITY_STOP_KM = 20;
export const MAX_CLUSTER_JUMP_KM = 18;
export const MIN_STOP_SEPARATION_KM = 0.12;

export function primaryPlaceName(name: string): string {
  return name
    .split(/[/|、·]/)[0]
    .replace(/[（(].*?[）)]/g, '')
    .trim();
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

  return [
    ...new Set([
      primary,
      name,
      withCity,
      stripped !== primary ? `${cityName}市${stripped}` : '',
      stripped !== primary ? `${cityName}${stripped}` : '',
      stripped.includes('啤酒') ? `${cityName}市啤酒博物馆` : '',
      stripped.includes('奥帆') ? `${cityName}奥帆中心` : '',
      stripped.includes('路') ? `${cityName}市市南区${stripped}` : '',
      stripped,
    ].filter(Boolean)),
  ];
}
