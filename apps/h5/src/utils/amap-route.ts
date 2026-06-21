import { loadAMap } from './amap'
import { distanceKm } from './geo-distance'
import { uniqueRouteWaypoints } from './route-order'

interface RoutePoint {
  lng: number
  lat: number
}

/** 市内行程：相邻站点直线连接，避免驾车 API 绕圈/叠线 */
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
    if (distanceKm(from, to) < 0.08) {
      continue
    }
    segments.push([
      [from.lng, from.lat],
      [to.lng, to.lat],
    ])
  }

  return segments
}

/** 绘制路线：默认直线分段（稳定）；仅跨区长段才尝试驾车 */
export async function buildRouteSegments(
  stops: RoutePoint[],
  _city?: string,
): Promise<[number, number][][]> {
  if (stops.length <= 1) {
    return []
  }

  await loadAMap(['AMap.Polyline'])
  return buildStraightRouteSegments(stops)
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
  return buildStraightRouteSegments(stops).flat()
}
