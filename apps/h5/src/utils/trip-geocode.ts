import * as geoApi from '../api/geo'
import {
  geocodeCityByJs,
  searchPlaceByJs,
  type GeoPoint,
} from './amap-geocode'
import {
  buildPlaceQueries,
  defaultCityCenter,
  extractDestinationRegion,
  inferStopCity,
  isCoordNearCluster,
  isCoordPlausibleForStop,
  isRemoteExcursion,
  isWithinDestination,
  isWideAreaDestination,
  lookupKnownLandmark,
  normalizeCityName,
  resolveStopGeoContext,
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
const GEO_STOP_TIMEOUT_MS = 8_000

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      setTimeout(() => resolve(fallback), ms)
    }),
  ])
}

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
    backendGeoCheckedAt = now
    backendGeoEnabled = null
    return false
  }
}

export async function geocodeCityCenter(destination: string): Promise<GeoPoint | null> {
  if (isWideAreaDestination(destination)) {
    return defaultCityCenter(extractDestinationRegion(destination))
  }

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
  clusterCity: string | null,
): Promise<TripStop> {
  const stopCity = inferStopCity(stop.name, destination)
  const { center: stopCenter } = resolveStopGeoContext(
    stop.name,
    destination,
    cityCenter,
  )
  const useCluster =
    clusterCity === stopCity && urbanClusterAnchors.length
      ? urbanClusterAnchors
      : []

  const known = lookupKnownLandmark(stop.name, destination)
  if (known && isWithinDestination(known, cityCenter, stop.name, destination)) {
    return { ...stop, ...known }
  }

  const remote = isRemoteExcursion(stop.name)
  const anchor = remote
    ? stopCenter
    : useCluster.length
      ? {
          lng: useCluster.reduce((sum, item) => sum + item.lng, 0) / useCluster.length,
          lat: useCluster.reduce((sum, item) => sum + item.lat, 0) / useCluster.length,
        }
      : stopCenter

  if (
    stop.lng != null &&
    stop.lat != null &&
    isWithinDestination({ lng: stop.lng, lat: stop.lat }, cityCenter, stop.name, destination) &&
    isCoordPlausibleForStop({ lng: stop.lng, lat: stop.lat }, anchor, stop.name) &&
    (shouldBindToCluster(stop.name)
      ? !useCluster.length || isCoordNearCluster({ lng: stop.lng, lat: stop.lat }, useCluster)
      : true)
  ) {
    return stop
  }

  const mapped = coordMapPlaceholder(stop, destination, cityCenter)
  if (mapped) {
    return mapped
  }

  let point: GeoPoint | null = null

  for (const query of buildPlaceQueries(stop.name, stopCity)) {
    point = await withTimeout(
      searchPlaceByJs(query, stopCity, anchor, useCluster),
      GEO_STOP_TIMEOUT_MS,
      null,
    )
    if (point && isWithinDestination(point, cityCenter, stop.name, destination)) {
      break
    }
    point = null
  }

  return point ? { ...stop, ...point } : stop
}

function stopGeoAnchor(
  stopName: string,
  destination: string,
  cityCenter: GeoPoint | null,
): GeoPoint | null {
  return resolveStopGeoContext(stopName, destination, cityCenter).center ?? cityCenter
}

const batchCoordCache = new Map<string, GeoPoint>()

function batchCacheKey(destination: string, name: string): string {
  return `${destination}::${name}`
}

function coordMapPlaceholder(
  stop: TripStop,
  destination: string,
  cityCenter: GeoPoint | null,
): TripStop | null {
  const mapped = batchCoordCache.get(batchCacheKey(destination, stop.name))
  if (!mapped) {
    return null
  }
  const stopCity = inferStopCity(stop.name, destination)
  const { center: stopCenter } = resolveStopGeoContext(
    stop.name,
    destination,
    cityCenter,
  )
  const anchor = stopCenter
  if (
    isWithinDestination(mapped, cityCenter, stop.name, destination) &&
    isCoordPlausibleForStop(mapped, anchor, stop.name)
  ) {
    return { ...stop, ...mapped }
  }
  return null
}

export async function resolveDayStops(
  stops: TripStop[],
  destination: string,
  dayIndex: number,
): Promise<TripStop[]> {
  const cityCenter = await geocodeCityCenter(destination)
  batchCoordCache.clear()
  const urbanClusterAnchors: GeoPoint[] = []
  let clusterCity: string | null = null

  const needsLookup = stops.some((stop) => {
    if (stop.lng == null || stop.lat == null) {
      return true
    }
    const anchor = stopGeoAnchor(stop.name, destination, cityCenter)
    return !isCoordPlausibleForStop(
      { lng: stop.lng, lat: stop.lat },
      anchor,
      stop.name,
    )
  })

  if (needsLookup && (await isBackendGeoEnabled())) {
    try {
      const batch = await geoApi.batchGeocode(
        destination,
        stops.map((stop) => stop.name),
      )
      batch.forEach((item) => {
        if (item.lng != null && item.lat != null) {
          const point = { lng: item.lng, lat: item.lat }
          const anchor = stopGeoAnchor(item.name, destination, cityCenter)
          if (
            isWithinDestination(point, cityCenter, item.name, destination) &&
            isCoordPlausibleForStop(point, anchor, item.name)
          ) {
            batchCoordCache.set(batchCacheKey(destination, item.name), point)
          }
        }
      })
    } catch {
      // batch failed — per-stop fallback below
    }
  }

  const resolved: TripStop[] = []
  for (let index = 0; index < stops.length; index += 1) {
    const stopCity = inferStopCity(stops[index].name, destination)
    if (clusterCity && stopCity !== clusterCity) {
      urbanClusterAnchors.length = 0
    }
    clusterCity = stopCity

    const stop = await resolveSingleStop(
      stops[index],
      destination,
      index,
      cityCenter,
      urbanClusterAnchors,
      clusterCity,
    )
    resolved.push(stop)
    if (
      stop.lng != null &&
      stop.lat != null &&
      shouldAddToUrbanCluster(stops[index].name) &&
      clusterCity === stopCity
    ) {
      urbanClusterAnchors.push({ lng: stop.lng, lat: stop.lat })
    }
  }

  const cleaned = dedupeNearbyStops(resolved)
  const ordered = optimizeStopOrder(cleaned, cityCenter, destination)
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
