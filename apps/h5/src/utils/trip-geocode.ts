import * as geoApi from '../api/geo'
import {
  geocodeCityByJs,
  searchPlaceByJs,
  type GeoPoint,
} from './amap-geocode'
import {
  buildPlaceQueries,
  isCoordNearCluster,
  isCoordPlausibleForStop,
  isCoordTooCloseToAny,
  isNonAttractionStop,
  isRemoteExcursion,
  isWithinDestination,
  lookupKnownLandmark,
  normalizeCityName,
  shouldAddToUrbanCluster,
  shouldBindToCluster,
} from './geo-distance'
import type { TripStop } from '../types/trip'
import {
  attachDriveSegments,
  dedupeNearbyStops,
  optimizeStopOrder,
} from './route-order'

let backendGeoEnabled: boolean | null = null
let backendGeoCheckedAt = 0
const GEO_STATUS_TTL_MS = 12_000

async function isBackendGeoEnabled() {
  const now = Date.now()
  if (
    backendGeoEnabled === true &&
    now - backendGeoCheckedAt < GEO_STATUS_TTL_MS
  ) {
    return true
  }

  try {
    const status = await geoApi.fetchGeoStatus()
    backendGeoCheckedAt = now
    backendGeoEnabled = status.enabled ? true : null
    return status.enabled
  } catch {
    // 后端热重载时会短暂 502，不要永久禁用后端 geocode
    backendGeoCheckedAt = now
    backendGeoEnabled = null
    return false
  }
}

export async function geocodeCityCenter(destination: string): Promise<GeoPoint | null> {
  if (await isBackendGeoEnabled()) {
    try {
      const point = await geoApi.geocodeCity(destination)
      if (point) {
        return point
      }
    } catch {
      // fallback to JS API
    }
  }

  return geocodeCityByJs(destination)
}

async function resolveSingleStop(
  stop: TripStop,
  destination: string,
  stopIndex: number,
  cityCenter: GeoPoint | null,
  urbanClusterAnchors: GeoPoint[],
  coordMap: Map<string, GeoPoint>,
): Promise<TripStop> {
  const city = normalizeCityName(destination) || destination

  if (isNonAttractionStop(stop.name)) {
    return stop
  }

  const known = lookupKnownLandmark(stop.name, city)
  if (known && isWithinDestination(known, cityCenter, stop.name)) {
    return { ...stop, ...known }
  }

  const remote = isRemoteExcursion(stop.name)
  const anchor = remote
    ? cityCenter
    : urbanClusterAnchors.length
      ? {
          lng: urbanClusterAnchors.reduce((sum, item) => sum + item.lng, 0) / urbanClusterAnchors.length,
          lat: urbanClusterAnchors.reduce((sum, item) => sum + item.lat, 0) / urbanClusterAnchors.length,
        }
      : cityCenter

  if (
    stop.lng != null &&
    stop.lat != null &&
    isWithinDestination({ lng: stop.lng, lat: stop.lat }, cityCenter, stop.name) &&
    isCoordPlausibleForStop({ lng: stop.lng, lat: stop.lat }, anchor, stop.name) &&
    (shouldBindToCluster(stop.name)
      ? isCoordNearCluster({ lng: stop.lng, lat: stop.lat }, urbanClusterAnchors)
      : true) &&
    !isCoordTooCloseToAny({ lng: stop.lng, lat: stop.lat }, urbanClusterAnchors)
  ) {
    return stop
  }

  const mapped = coordMap.get(stop.name)
  if (
    mapped &&
    isWithinDestination(mapped, cityCenter, stop.name) &&
    isCoordPlausibleForStop(mapped, anchor, stop.name) &&
    (shouldBindToCluster(stop.name)
      ? isCoordNearCluster(mapped, urbanClusterAnchors)
      : true) &&
    !isCoordTooCloseToAny(mapped, urbanClusterAnchors)
  ) {
    return { ...stop, ...mapped }
  }

  let point: GeoPoint | null = null

  for (const query of buildPlaceQueries(stop.name, city)) {
    point = await searchPlaceByJs(query, city, anchor, urbanClusterAnchors)
    if (point && isWithinDestination(point, cityCenter, stop.name)) {
      break
    }
    point = null
  }

  return point ? { ...stop, ...point } : stop
}

export async function resolveDayStops(
  stops: TripStop[],
  destination: string,
  dayIndex: number,
): Promise<TripStop[]> {
  const cityCenter = await geocodeCityCenter(destination)
  const coordMap = new Map<string, GeoPoint>()
  const urbanClusterAnchors: GeoPoint[] = []

  const needsLookup = stops.some(
    (stop) =>
      stop.lng == null ||
      stop.lat == null ||
      !isCoordPlausibleForStop({ lng: stop.lng!, lat: stop.lat! }, cityCenter, stop.name) ||
      (shouldBindToCluster(stop.name) &&
        !isCoordNearCluster({ lng: stop.lng!, lat: stop.lat! }, urbanClusterAnchors)),
  )

  if (needsLookup && (await isBackendGeoEnabled())) {
    try {
      const batch = await geoApi.batchGeocode(
        destination,
        stops.map((stop) => stop.name),
      )
      batch.forEach((item) => {
        if (item.lng != null && item.lat != null) {
          const point = { lng: item.lng, lat: item.lat }
          if (
            isWithinDestination(point, cityCenter, item.name) &&
            isCoordPlausibleForStop(point, cityCenter, item.name)
          ) {
            coordMap.set(item.name, point)
          }
        }
      })
    } catch {
      // batch failed — per-stop fallback below
    }
  }

  const resolved: TripStop[] = []
  for (let index = 0; index < stops.length; index += 1) {
    const stop = await resolveSingleStop(
      stops[index],
      destination,
      index,
      cityCenter,
      urbanClusterAnchors,
      coordMap,
    )
    resolved.push(stop)
    if (stop.lng != null && stop.lat != null && shouldAddToUrbanCluster(stops[index].name)) {
      urbanClusterAnchors.push({ lng: stop.lng, lat: stop.lat })
    }
  }

  const cleaned = dedupeNearbyStops(resolved)
  const ordered = optimizeStopOrder(cleaned, cityCenter)
  return attachDriveSegments(ordered)
}

export async function resolveTripStops(
  dayPlans: Array<{ day: number; places: TripStop[] }>,
  destination: string,
): Promise<Array<{ day: number; places: TripStop[] }>> {
  const resolved: Array<{ day: number; places: TripStop[] }> = []

  for (let dayIndex = 0; dayIndex < dayPlans.length; dayIndex += 1) {
    const day = dayPlans[dayIndex]
    const places = await resolveDayStops(day.places, destination, dayIndex)
    resolved.push({ day: day.day, places })
  }

  return resolved
}
