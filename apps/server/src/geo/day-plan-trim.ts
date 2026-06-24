import {
  distanceKm,
  isRemoteExcursion,
  isRemoteStopPoint,
  primaryPlaceName,
  type GeoPoint,
} from './geo.utils';
import type { TripStop } from '../trips/trip.types';

export const MAX_STOPS_PER_DAY = 3;
export const MAX_URBAN_SPAN_KM = 16;

function hasCoords(stop: TripStop): stop is TripStop & { lng: number; lat: number } {
  return stop.lng != null && stop.lat != null;
}

function stopNameKey(name: string): string {
  const primary = primaryPlaceName(name).replace(/\s/g, '');
  if (/颐和园/.test(primary)) {
    return '颐和园';
  }
  if (/圆明园/.test(primary)) {
    return '圆明园';
  }
  if (/故宫/.test(primary)) {
    return '故宫';
  }
  return primary;
}

function dedupeStopsByName(stops: TripStop[]): TripStop[] {
  const seen = new Set<string>();
  const result: TripStop[] = [];
  for (const stop of stops) {
    const key = stopNameKey(stop.name);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(stop);
  }
  return result;
}

/** 城区点若形成两个相距过远的簇，仍保留全部（地图需展示所有站点） */
function keepUrbanCluster(
  stops: Array<TripStop & { lng: number; lat: number }>,
): Array<TripStop & { lng: number; lat: number }> {
  return stops;
}

/** geocode 后按坐标裁剪不合理同天站点 */
export function trimDayPlanStops(
  stops: TripStop[],
  cityCenter: GeoPoint | null,
): TripStop[] {
  let result = dedupeStopsByName(stops);

  const remoteByName = result.filter((stop) => isRemoteExcursion(stop.name));
  const urbanByName = result.filter((stop) => !isRemoteExcursion(stop.name));

  if (remoteByName.length && urbanByName.length) {
    result = remoteByName;
  }

  const located = result.filter(hasCoords);
  const missing = result.filter((stop) => !hasCoords(stop));

  const remoteLocated = located.filter((stop) =>
    isRemoteStopPoint(stop.name, stop, cityCenter),
  );
  const urbanLocated = located.filter((stop) => !remoteLocated.includes(stop));

  let keptLocated: Array<TripStop & { lng: number; lat: number }> = [];

  if (remoteLocated.length && urbanLocated.length) {
    keptLocated = remoteLocated;
  } else if (urbanLocated.length) {
    keptLocated = keepUrbanCluster(urbanLocated);
  } else {
    keptLocated = remoteLocated;
  }

  const merged = [...keptLocated, ...missing].slice(0, MAX_STOPS_PER_DAY);
  return dedupeStopsByName(merged);
}
