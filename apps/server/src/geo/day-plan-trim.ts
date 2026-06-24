import {
  isRemoteExcursion,
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

/** geocode 后裁剪同天站点：仅去同名、区分长城一日游，不按省中心距离删点 */
export function trimDayPlanStops(
  stops: TripStop[],
  _cityCenter: GeoPoint | null,
): TripStop[] {
  let result = dedupeStopsByName(stops);

  const remoteByName = result.filter((stop) => isRemoteExcursion(stop.name));
  const urbanByName = result.filter((stop) => !isRemoteExcursion(stop.name));

  if (remoteByName.length && urbanByName.length) {
    result = remoteByName;
  }

  const located = result.filter(hasCoords);
  const missing = result.filter((stop) => !hasCoords(stop));

  return dedupeStopsByName([...located, ...missing].slice(0, MAX_STOPS_PER_DAY));
}
