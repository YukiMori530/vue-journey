import { distanceKm, type GeoPoint } from './geo-distance'
import type { TripStop } from '../types/trip'

function hasCoords(stop: TripStop): stop is TripStop & { lng: number; lat: number } {
  return stop.lng != null && stop.lat != null
}

function centroid(stops: Array<TripStop & { lng: number; lat: number }>): GeoPoint {
  const sum = stops.reduce(
    (acc, stop) => ({ lng: acc.lng + stop.lng, lat: acc.lat + stop.lat }),
    { lng: 0, lat: 0 },
  )
  return { lng: sum.lng / stops.length, lat: sum.lat / stops.length }
}

/** 最近邻排序，减少同天折返 */
export function orderStopsByNearestNeighbor(stops: TripStop[]): TripStop[] {
  const located = stops.filter(hasCoords)
  const missing = stops.filter((stop) => !hasCoords(stop))

  if (located.length <= 2) {
    return [...located, ...missing]
  }

  const ordered: Array<TripStop & { lng: number; lat: number }> = []
  const remaining = [...located]

  let current = remaining.shift()!
  ordered.push(current)

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

  return [...ordered, ...missing]
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

export function dayAnchor(stops: TripStop[], cityCenter: GeoPoint | null): GeoPoint | null {
  const located = stops.filter(hasCoords)
  if (located.length) {
    return centroid(located)
  }
  return cityCenter
}
