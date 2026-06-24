import { loadAMap } from './amap'
import { distanceKm } from './geo-distance'
import { uniqueRouteWaypoints } from './route-order'
import type { TripStop } from '../types/trip'

interface RoutePoint {
  lng: number
  lat: number
}

export interface DriveSegmentResult {
  path: [number, number][]
  distanceKm: number
  driveMinutes: number
}

/** 相邻站点直线距离 ≥ 此值时尝试高德驾车路线 */
export const DRIVING_THRESHOLD_KM = 3
const MIN_DRAW_KM = 0.08
const DRIVE_SEGMENT_TIMEOUT_MS = 10_000

const segmentCache = new Map<string, DriveSegmentResult | 'fail'>()

function segmentKey(from: RoutePoint, to: RoutePoint): string {
  return `${from.lng.toFixed(5)},${from.lat.toFixed(5)}->${to.lng.toFixed(5)},${to.lat.toFixed(5)}`
}

function straightPath(from: RoutePoint, to: RoutePoint): [number, number][] {
  return [
    [from.lng, from.lat],
    [to.lng, to.lat],
  ]
}

function estimateDriveMinutes(km: number): number {
  return Math.max(3, Math.round((km / 28) * 60))
}

function pathFromDrivingRoute(route: {
  steps?: Array<{ path?: Array<{ lng: number; lat: number }> }>
}): [number, number][] {
  const path: [number, number][] = []
  for (const step of route.steps ?? []) {
    for (const point of step.path ?? []) {
      path.push([point.lng, point.lat])
    }
  }
  return path
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), ms)
    }),
  ])
}

async function requestDrivingSegment(
  from: RoutePoint,
  to: RoutePoint,
): Promise<DriveSegmentResult | null> {
  const key = segmentKey(from, to)
  const cached = segmentCache.get(key)
  if (cached === 'fail') {
    return null
  }
  if (cached) {
    return cached
  }

  const AMap = await loadAMap(['AMap.Driving'])

  const result = await withTimeout(
    new Promise<DriveSegmentResult | null>((resolve) => {
      const driving = new AMap.Driving({
        policy: AMap.DrivingPolicy.LEAST_TIME,
      })

      driving.search(
        new AMap.LngLat(from.lng, from.lat),
        new AMap.LngLat(to.lng, to.lat),
        (
          status: string,
          searchResult: {
            routes?: Array<{
              distance?: number
              time?: number
              steps?: Array<{ path?: Array<{ lng: number; lat: number }> }>
            }>
          },
        ) => {
          if (status !== 'complete') {
            resolve(null)
            return
          }

          const route = searchResult.routes?.[0]
          if (!route) {
            resolve(null)
            return
          }

          const path = pathFromDrivingRoute(route)
          if (path.length < 2) {
            resolve(null)
            return
          }

          resolve({
            path,
            distanceKm: Number(((route.distance ?? 0) / 1000).toFixed(1)),
            driveMinutes: Math.max(1, Math.round((route.time ?? 0) / 60)),
          })
        },
      )
    }),
    DRIVE_SEGMENT_TIMEOUT_MS,
  )

  if (result) {
    segmentCache.set(key, result)
    return result
  }

  segmentCache.set(key, 'fail')
  return null
}

/** 单段路线：≥3km 尝试驾车，否则或失败时回退直线 */
export async function fetchRouteSegment(
  from: RoutePoint,
  to: RoutePoint,
): Promise<DriveSegmentResult> {
  const km = distanceKm(from, to)

  if (km < MIN_DRAW_KM) {
    return {
      path: straightPath(from, to),
      distanceKm: Number(km.toFixed(1)),
      driveMinutes: estimateDriveMinutes(km),
    }
  }

  if (km >= DRIVING_THRESHOLD_KM) {
    const driven = await requestDrivingSegment(from, to)
    if (driven) {
      return driven
    }
  }

  return {
    path: straightPath(from, to),
    distanceKm: Number(km.toFixed(1)),
    driveMinutes: estimateDriveMinutes(km),
  }
}

export function buildStraightRouteSegments(
  stops: RoutePoint[],
): [number, number][][] {
  const waypoints = uniqueRouteWaypoints(stops)
  if (waypoints.length <= 1) {
    return []
  }

  const segments: [number, number][][] = []
  for (let index = 0; index < waypoints.length - 1; index += 1) {
    const from = waypoints[index]
    const to = waypoints[index + 1]
    if (distanceKm(from, to) < MIN_DRAW_KM) {
      continue
    }
    segments.push(straightPath(from, to))
  }

  return segments
}

/** 混合路线：近距直线，≥3km 驾车，失败回退直线 */
export async function buildRouteSegments(
  stops: RoutePoint[],
  _city?: string,
): Promise<[number, number][][]> {
  const waypoints = uniqueRouteWaypoints(stops)
  if (waypoints.length <= 1) {
    return []
  }

  await loadAMap(['AMap.Driving', 'AMap.Polyline'])
  const segments: [number, number][][] = []

  for (let index = 0; index < waypoints.length - 1; index += 1) {
    const segment = await fetchRouteSegment(waypoints[index], waypoints[index + 1])
    if (segment.path.length >= 2) {
      segments.push(segment.path)
    }
  }

  return segments
}

/** 为列表补充真实驾车里程/时长（仅 ≥3km 段调 API，结果有缓存） */
export async function enrichStopsDriveMetrics(stops: TripStop[]): Promise<TripStop[]> {
  if (stops.length <= 1) {
    return stops
  }

  const enriched = stops.map((stop) => ({ ...stop }))

  for (let index = 1; index < enriched.length; index += 1) {
    const prev = enriched[index - 1]
    const curr = enriched[index]
    if (
      prev.lng == null ||
      prev.lat == null ||
      curr.lng == null ||
      curr.lat == null
    ) {
      continue
    }

    const from = { lng: prev.lng, lat: prev.lat }
    const to = { lng: curr.lng, lat: curr.lat }
    if (distanceKm(from, to) < DRIVING_THRESHOLD_KM) {
      continue
    }

    const segment = await fetchRouteSegment(from, to)
    enriched[index] = {
      ...curr,
      distanceKm: segment.distanceKm,
      driveMinutes: segment.driveMinutes,
    }
  }

  return enriched
}

export function sumStopRouteKm(stops: TripStop[]): number {
  let total = 0
  for (let index = 1; index < stops.length; index += 1) {
    const stop = stops[index]
    if (stop.distanceKm != null) {
      total += stop.distanceKm
      continue
    }
    const prev = stops[index - 1]
    if (
      prev.lng != null &&
      prev.lat != null &&
      stop.lng != null &&
      stop.lat != null
    ) {
      total += distanceKm(
        { lng: prev.lng, lat: prev.lat },
        { lng: stop.lng, lat: stop.lat },
      )
    }
  }
  return Number(total.toFixed(1))
}

/** @deprecated 使用 buildRouteSegments */
export async function buildDrivingSegments(
  stops: RoutePoint[],
  city?: string,
): Promise<[number, number][][]> {
  return buildRouteSegments(stops, city)
}

/** @deprecated */
export async function buildDrivingPath(stops: RoutePoint[]): Promise<[number, number][]> {
  return buildRouteSegments(stops).then((segments) => segments.flat())
}
