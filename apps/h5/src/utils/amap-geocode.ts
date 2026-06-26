import { loadAMap } from './amap'
import {
  buildPlaceQueries,
  distanceKm,
  isCoordNearCluster,
  isCoordPlausibleForStop,
  isNonAttractionPoi,
  isOffshorePoi,
  isIslandExcursion,
  MIN_POI_NAME_SCORE,
  poiNameScore,
  shouldBindToCluster,
  type GeoPoint,
} from './geo-distance'
import {
  cityCacheKey,
  geocodeCacheKey,
  getCachedGeocode,
  setCachedGeocode,
} from './geocode-cache'

export type { GeoPoint }

function readMemoryCache(key: string): GeoPoint | null {
  return memoryCache.get(key) ?? getCachedGeocode(key)
}

function writeMemoryCache(key: string, point: GeoPoint) {
  memoryCache.set(key, point)
  setCachedGeocode(key, point)
}

const memoryCache = new Map<string, GeoPoint>()

function cacheKey(kind: 'city' | 'poi', city: string, keyword: string) {
  return kind === 'city' ? cityCacheKey(city || keyword) : geocodeCacheKey(city, keyword)
}

export async function geocodeCityByJs(keyword: string): Promise<GeoPoint | null> {
  const key = cacheKey('city', '', keyword)
  const cached = readMemoryCache(key)
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
          writeMemoryCache(key, point)
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

/** 地址 → 经纬度（高德 JS 地理编码，POI 搜索失败时的兜底） */
export async function geocodeAddressByJs(
  address: string,
  city: string,
): Promise<GeoPoint | null> {
  const key = geocodeCacheKey(city, address)
  const cached = readMemoryCache(key)
  if (cached) {
    return cached
  }

  for (const query of buildPlaceQueries(address, city)) {
    const point = await geocodeCityByJs(query.includes(city) ? query : `${city}${query}`)
    if (point) {
      writeMemoryCache(key, point)
      return point
    }
  }

  return null
}

function pickBestJsPoi(
  pois: Array<{ name: string; location: { lng: number; lat: number } }>,
  keyword: string,
  anchor: GeoPoint | null,
  clusterAnchors: GeoPoint[],
): GeoPoint | null {
  const bindCluster = shouldBindToCluster(keyword)

  const rank = (useCluster: boolean) =>
    pois
      .filter((poi) => poi.location)
      .filter((poi) => !isNonAttractionPoi(poi.name))
      .filter((poi) => !(isOffshorePoi(poi.name) && !isIslandExcursion(keyword)))
      .map((poi) => ({
        point: { lng: poi.location.lng, lat: poi.location.lat },
        score: poiNameScore(poi.name, keyword),
      }))
      .filter(({ score }) => score >= MIN_POI_NAME_SCORE)
      .filter(({ point }) =>
        anchor ? isCoordPlausibleForStop(point, anchor, keyword) : true,
      )
      .filter(({ point }) =>
        bindCluster && useCluster && clusterAnchors.length
          ? isCoordNearCluster(point, clusterAnchors)
          : true,
      )

  let candidates = rank(true)
  if (!candidates.length && bindCluster && clusterAnchors.length) {
    candidates = rank(false)
  }

  if (!candidates.length) {
    return null
  }

  candidates.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score
    }
    if (!anchor) {
      return 0
    }
    return distanceKm(anchor, a.point) - distanceKm(anchor, b.point)
  })

  return candidates[0].point
}

export async function searchPlaceByJs(
  keyword: string,
  city: string,
  anchor?: GeoPoint | null,
  clusterAnchors: GeoPoint[] = [],
): Promise<GeoPoint | null> {
  const key = cacheKey('poi', city, keyword)
  const cached = readMemoryCache(geocodeCacheKey(city, keyword)) ?? readMemoryCache(key)
  if (
    cached &&
    isCoordPlausibleForStop(cached, anchor ?? null, keyword) &&
    (shouldBindToCluster(keyword)
      ? isCoordNearCluster(cached, clusterAnchors)
      : true)
  ) {
    return cached
  }

  try {
    await loadAMap(['AMap.PlaceSearch'])
    const placeSearch = new AMap.PlaceSearch({
      city,
      citylimit: true,
      pageSize: 10,
    })

    for (const query of buildPlaceQueries(keyword, city)) {
      const point = await new Promise<GeoPoint | null>((resolve) => {
        placeSearch.search(query, (status, result) => {
          const pois = result.poiList?.pois ?? []
          if (status !== 'complete' || !pois.length) {
            resolve(null)
            return
          }

          resolve(pickBestJsPoi(pois, keyword, anchor ?? null, clusterAnchors))
        })
      })

      if (point) {
        writeMemoryCache(key, point)
        writeMemoryCache(geocodeCacheKey(city, keyword), point)
        return point
      }
    }

    return null
  } catch {
    return null
  }
}

/** @deprecated 仅作兜底，优先使用 fallbackCoordsNear */
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
