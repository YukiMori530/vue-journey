import { loadAMap } from './amap'

export interface GeoPoint {
  lng: number
  lat: number
}

const memoryCache = new Map<string, GeoPoint>()

function cacheKey(kind: 'city' | 'poi', city: string, keyword: string) {
  return `${kind}:${city}:${keyword}`
}

function readCache(key: string): GeoPoint | null {
  return memoryCache.get(key) ?? null
}

function writeCache(key: string, point: GeoPoint) {
  memoryCache.set(key, point)
}

export async function geocodeCityByJs(keyword: string): Promise<GeoPoint | null> {
  const key = cacheKey('city', '', keyword)
  const cached = readCache(key)
  if (cached) {
    return cached
  }

  try {
    await loadAMap(['AMap.Geocoder'])
    const geocoder = new AMap.Geocoder()

    return await new Promise((resolve) => {
      geocoder.getLocation(keyword, (status, result) => {
        if (status === 'complete' && result.geocodes?.length) {
          const location = result.geocodes[0].location
          const point = { lng: location.lng, lat: location.lat }
          writeCache(key, point)
          resolve(point)
          return
        }
        resolve(null)
      })
    })
  } catch {
    return null
  }
}

export async function searchPlaceByJs(
  keyword: string,
  city: string,
): Promise<GeoPoint | null> {
  const key = cacheKey('poi', city, keyword)
  const cached = readCache(key)
  if (cached) {
    return cached
  }

  try {
    await loadAMap(['AMap.PlaceSearch'])
    const placeSearch = new AMap.PlaceSearch({
      city,
      citylimit: true,
      pageSize: 1,
    })

    return await new Promise((resolve) => {
      placeSearch.search(keyword, (status, result) => {
        const poi = result.poiList?.pois?.[0]
        if (status === 'complete' && poi?.location) {
          const point = { lng: poi.location.lng, lat: poi.location.lat }
          writeCache(key, point)
          resolve(point)
          return
        }
        resolve(null)
      })
    })
  } catch {
    return null
  }
}

export function fallbackCoords(
  center: GeoPoint,
  dayIndex: number,
  stopIndex: number,
): GeoPoint {
  const angle = dayIndex * 1.2 + stopIndex * 0.9
  const radius = 0.012 + stopIndex * 0.006
  return {
    lng: center.lng + Math.cos(angle) * radius,
    lat: center.lat + Math.sin(angle) * radius,
  }
}
