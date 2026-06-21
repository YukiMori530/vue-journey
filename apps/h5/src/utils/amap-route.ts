import { loadAMap } from './amap'
import { distanceKm } from './geo-distance'

interface RoutePoint {
  lng: number
  lat: number
}

function toLngLat(point: RoutePoint) {
  return new AMap.LngLat(point.lng, point.lat)
}

function searchDrivingSegment(
  driving: AMap.Driving,
  from: RoutePoint,
  to: RoutePoint,
): Promise<[number, number][]> {
  return new Promise((resolve) => {
    driving.search(toLngLat(from), toLngLat(to), (status, result) => {
      const route = result?.routes?.[0]
      if (status !== 'complete' || !route?.steps?.length) {
        resolve([
          [from.lng, from.lat],
          [to.lng, to.lat],
        ])
        return
      }

      const path: [number, number][] = []
      route.steps.forEach((step) => {
        step.path.forEach((point) => {
          path.push([point.lng, point.lat])
        })
      })
      resolve(path.length ? path : [[from.lng, from.lat], [to.lng, to.lat]])
    })
  })
}

function appendPath(
  fullPath: [number, number][],
  segment: [number, number][],
) {
  if (!segment.length) {
    return
  }

  if (!fullPath.length) {
    fullPath.push(...segment)
    return
  }

  const [lastLng, lastLat] = fullPath[fullPath.length - 1]
  const [firstLng, firstLat] = segment[0]
  const gap = distanceKm(
    { lng: lastLng, lat: lastLat },
    { lng: firstLng, lat: firstLat },
  )

  if (gap < 0.05) {
    fullPath.push(...segment.slice(1))
  } else {
    fullPath.push(...segment)
  }
}

/** 按驾车路线连接站点，避免直线跨海 */
export async function buildDrivingPath(stops: RoutePoint[]): Promise<[number, number][]> {
  if (stops.length <= 1) {
    return stops.map((stop) => [stop.lng, stop.lat])
  }

  await loadAMap(['AMap.Driving'])

  const driving = new AMap.Driving({
    policy: AMap.DrivingPolicy.LEAST_TIME,
    hideMarkers: true,
  })

  const fullPath: [number, number][] = []

  for (let index = 0; index < stops.length - 1; index += 1) {
    const from = stops[index]
    const to = stops[index + 1]
    const gap = distanceKm(from, to)

    if (gap < 0.08) {
      if (!fullPath.length) {
        fullPath.push([from.lng, from.lat])
      }
      fullPath.push([to.lng, to.lat])
      continue
    }

    const segment = await searchDrivingSegment(driving, from, to)
    appendPath(fullPath, segment)
  }

  return fullPath
}
