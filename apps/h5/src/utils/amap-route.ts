import { loadAMap } from './amap'

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
    const segment = await searchDrivingSegment(driving, stops[index], stops[index + 1])
    if (fullPath.length && segment.length) {
      fullPath.push(...segment.slice(1))
    } else {
      fullPath.push(...segment)
    }
  }

  return fullPath
}
