import {
  distanceKm,
  isRemoteExcursion,
  isRemoteStopPoint,
  type GeoPoint,
} from './geo.utils';
import type { TripStop } from '../trips/trip.types';

function hasCoords(stop: TripStop): stop is TripStop & { lng: number; lat: number } {
  return stop.lng != null && stop.lat != null;
}

function routeLength(stops: Array<TripStop & { lng: number; lat: number }>): number {
  let total = 0;
  for (let index = 1; index < stops.length; index += 1) {
    total += distanceKm(stops[index - 1], stops[index]);
  }
  return total;
}

function nearestNeighborTour(
  stops: Array<TripStop & { lng: number; lat: number }>,
  startIndex: number,
): Array<TripStop & { lng: number; lat: number }> {
  const ordered: Array<TripStop & { lng: number; lat: number }> = [stops[startIndex]];
  const remaining = stops.filter((_, index) => index !== startIndex);

  let current = stops[startIndex];
  while (remaining.length) {
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    remaining.forEach((stop, index) => {
      const dist = distanceKm(current, stop);
      if (dist < nearestDistance) {
        nearestDistance = dist;
        nearestIndex = index;
      }
    });

    current = remaining.splice(nearestIndex, 1)[0];
    ordered.push(current);
  }

  return ordered;
}

function optimizeGroup(
  stops: Array<TripStop & { lng: number; lat: number }>,
  cityCenter: GeoPoint | null,
): Array<TripStop & { lng: number; lat: number }> {
  if (stops.length <= 2) {
    return stops;
  }

  let best = nearestNeighborTour(stops, 0);
  let bestLength = routeLength(best);

  for (let start = 0; start < stops.length; start += 1) {
    const candidate = nearestNeighborTour(stops, start);
    const length = routeLength(candidate);
    if (length < bestLength) {
      best = candidate;
      bestLength = length;
    }
  }

  if (cityCenter) {
    const startIndex = stops.reduce((bestIndex, stop, index) => {
      const currentBest = distanceKm(cityCenter, stops[bestIndex]);
      const candidate = distanceKm(cityCenter, stop);
      return candidate < currentBest ? index : bestIndex;
    }, 0);
    best = nearestNeighborTour(stops, startIndex);
  }

  return best;
}

/** 城区与远郊分区排序：先城区簇，后远郊（如八达岭） */
export function orderStopsByZones(
  stops: TripStop[],
  cityCenter: GeoPoint | null,
): TripStop[] {
  const located = stops.filter(hasCoords);
  const missing = stops.filter((stop) => !hasCoords(stop));

  if (located.length <= 2) {
    return stops;
  }

  const remote = located.filter((stop) =>
    isRemoteStopPoint(stop.name, stop, cityCenter),
  );
  const urban = located.filter((stop) => !remote.includes(stop));

  const orderedUrban = urban.length ? optimizeGroup(urban, cityCenter) : [];
  const orderedRemote = remote.length
    ? optimizeGroup(remote, cityCenter)
    : [];

  return [...orderedUrban, ...orderedRemote, ...missing];
}

export function dayAnchor(stops: TripStop[], cityCenter: GeoPoint | null): GeoPoint | null {
  const urbanLocated = stops
    .filter(hasCoords)
    .filter((stop) => !isRemoteExcursion(stop.name));

  if (urbanLocated.length) {
    const sum = urbanLocated.reduce(
      (acc, stop) => ({ lng: acc.lng + stop.lng, lat: acc.lat + stop.lat }),
      { lng: 0, lat: 0 },
    );
    return { lng: sum.lng / urbanLocated.length, lat: sum.lat / urbanLocated.length };
  }

  const located = stops.filter(hasCoords);
  if (located.length) {
    const sum = located.reduce(
      (acc, stop) => ({ lng: acc.lng + stop.lng, lat: acc.lat + stop.lat }),
      { lng: 0, lat: 0 },
    );
    return { lng: sum.lng / located.length, lat: sum.lat / located.length };
  }

  return cityCenter;
}

/** @deprecated 使用 orderStopsByZones */
export function orderStopsByNearestNeighbor(stops: TripStop[]): TripStop[] {
  return orderStopsByZones(stops, null);
}
