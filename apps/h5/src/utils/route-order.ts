import { distanceKm, isRemoteStopPoint, primaryPlaceName, type GeoPoint } from './geo-distance'
import type { TripStop } from '../types/trip'

const MIN_WAYPOINT_KM = 0.2
const MAX_STOPS_PER_DAY = 3

function stopNameKey(name: string): string {
  const primary = primaryPlaceName(name).replace(/\s/g, '')
  if (/颐和园/.test(primary)) return '颐和园'
  if (/圆明园/.test(primary)) return '圆明园'
  if (/故宫/.test(primary)) return '故宫'
  return primary
}

function dedupeStopsByName(stops: TripStop[]): TripStop[] {
  const seen = new Set<string>()
  const result: TripStop[] = []
  for (const stop of stops) {
    const key = stopNameKey(stop.name)
    if (seen.has(key)) continue
    seen.add(key)
    result.push(stop)
  }
  return result
}

function hasCoords(stop: TripStop): stop is TripStop & { lng: number; lat: number } {
  return stop.lng != null && stop.lat != null
}

function routeLength(stops: Array<TripStop & { lng: number; lat: number }>): number {
  let total = 0
  for (let index = 1; index < stops.length; index += 1) {
    total += distanceKm(stops[index - 1], stops[index])
  }
  return total
}

function nearestNeighborTour(
  stops: Array<TripStop & { lng: number; lat: number }>,
  startIndex: number,
): Array<TripStop & { lng: number; lat: number }> {
  const ordered: Array<TripStop & { lng: number; lat: number }> = [stops[startIndex]]
  const remaining = stops.filter((_, index) => index !== startIndex)

  let current = stops[startIndex]
  while (remaining.length) {
    let nearestIndex = 0
    let nearestDistance = Number.POSITIVE_INFINITY

    remaining.forEach((stop, index) => {
      const dist = distanceKm(current, stop)
      if (dist < nearestDistance) {
        nearestDistance = dist
        nearestIndex = index
      }
    })

    current = remaining.splice(nearestIndex, 1)[0]
    ordered.push(current)
  }

  return ordered
}

function twoOptImprove(
  stops: Array<TripStop & { lng: number; lat: number }>,
): Array<TripStop & { lng: number; lat: number }> {
  if (stops.length < 4) {
    return stops
  }

  let path = [...stops]
  let improved = true

  while (improved) {
    improved = false
    for (let i = 0; i < path.length - 2; i += 1) {
      for (let j = i + 2; j < path.length; j += 1) {
        const nextJ = j + 1
        if (nextJ >= path.length) {
          continue
        }

        const before =
          distanceKm(path[i], path[i + 1]) + distanceKm(path[j], path[nextJ])
        const after =
          distanceKm(path[i], path[j]) + distanceKm(path[i + 1], path[nextJ])

        if (after + 0.05 < before) {
          path = [
            ...path.slice(0, i + 1),
            ...path.slice(i + 1, j + 1).reverse(),
            ...path.slice(j + 1),
          ]
          improved = true
        }
      }
    }
  }

  return path
}

/** 仅去重同名站点；过近坐标由 uniqueRouteWaypoints 在画线时处理，不删列表项 */
export function dedupeNearbyStops(stops: TripStop[]): TripStop[] {
  return dedupeStopsByName(stops).slice(0, MAX_STOPS_PER_DAY)
}

/** 优化同天访问顺序：城区一组、远郊（长城等）放最后 */
export function optimizeStopOrder(
  stops: TripStop[],
  cityCenter?: GeoPoint | null,
  destination?: string,
): TripStop[] {
  const located = stops.filter(hasCoords)
  const missing = stops.filter((stop) => !hasCoords(stop))

  if (located.length <= 2) {
    return stops
  }

  const remote = located.filter((stop) =>
    isRemoteStopPoint(stop.name, stop, cityCenter ?? null, destination),
  )
  const urban = located.filter((stop) => !remote.includes(stop))

  const orderGroup = (group: Array<TripStop & { lng: number; lat: number }>) => {
    if (group.length <= 2) {
      return group
    }

    let best = nearestNeighborTour(group, 0)
    let bestLength = routeLength(best)

    for (let start = 0; start < group.length; start += 1) {
      const candidate = twoOptImprove(nearestNeighborTour(group, start))
      const length = routeLength(candidate)
      if (length < bestLength) {
        best = candidate
        bestLength = length
      }
    }

    if (cityCenter && group.length) {
      const startIndex = group.reduce((bestIndex, stop, index) => {
        const currentBest = distanceKm(cityCenter, group[bestIndex])
        const candidate = distanceKm(cityCenter, stop)
        return candidate < currentBest ? index : bestIndex
      }, 0)
      best = twoOptImprove(nearestNeighborTour(group, startIndex))
    }

    return twoOptImprove(best)
  }

  if (remote.length && urban.length) {
    return [
      ...orderGroup(urban),
      ...orderGroup(remote),
      ...missing,
    ].slice(0, MAX_STOPS_PER_DAY)
  }

  return [...orderGroup(urban), ...orderGroup(remote), ...missing].slice(
    0,
    MAX_STOPS_PER_DAY,
  )
}

export function uniqueRouteWaypoints(
  stops: Array<{ lng: number; lat: number }>,
): Array<{ lng: number; lat: number }> {
  const result: Array<{ lng: number; lat: number }> = []

  for (const stop of stops) {
    const prev = result[result.length - 1]
    if (!prev || distanceKm(prev, stop) >= MIN_WAYPOINT_KM) {
      result.push(stop)
    }
  }

  return result
}

/** 按相邻站点计算路程与预估驾车时间 */
export function attachDriveSegments(stops: TripStop[]): TripStop[] {
  return stops.map((stop, index) => {
    if (index === 0) {
      return stop
    }

    const prev = stops[index - 1]
    if (
      prev.lng == null ||
      prev.lat == null ||
      stop.lng == null ||
      stop.lat == null
    ) {
      return stop
    }

    const km = distanceKm(
      { lng: prev.lng, lat: prev.lat },
      { lng: stop.lng, lat: stop.lat },
    )
    const driveMinutes = Math.max(3, Math.round((km / 28) * 60))

    return {
      ...stop,
      distanceKm: Number(km.toFixed(1)),
      driveMinutes,
    }
  })
}

export function prepareStopsForRoute(
  stops: TripStop[],
  cityCenter?: GeoPoint | null,
  destination?: string,
): TripStop[] {
  return attachDriveSegments(
    optimizeStopOrder(dedupeNearbyStops(stops), cityCenter, destination),
  )
}

export function dayAnchor(stops: TripStop[], cityCenter: GeoPoint | null): GeoPoint | null {
  const located = stops.filter(hasCoords)
  if (located.length) {
    const sum = located.reduce(
      (acc, stop) => ({ lng: acc.lng + stop.lng, lat: acc.lat + stop.lat }),
      { lng: 0, lat: 0 },
    )
    return { lng: sum.lng / located.length, lat: sum.lat / located.length }
  }
  return cityCenter
}
