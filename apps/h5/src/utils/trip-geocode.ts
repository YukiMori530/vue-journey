import * as geoApi from '../api/geo'
import {
  fallbackCoords,
  geocodeCityByJs,
  searchPlaceByJs,
  type GeoPoint,
} from './amap-geocode'
import {
  buildPlaceQueries,
  fallbackCoordsNear,
  isCoordNearCluster,
  isCoordPlausible,
  isCoordTooCloseToAny,
} from './geo-distance'
import type { TripStop } from '../types/trip'
import { attachDriveSegments } from './route-order'

let backendGeoEnabled: boolean | null = null

async function isBackendGeoEnabled() {
  if (backendGeoEnabled != null) {
    return backendGeoEnabled
  }
  try {
    const status = await geoApi.fetchGeoStatus()
    backendGeoEnabled = status.enabled
  } catch {
    backendGeoEnabled = false
  }
  return backendGeoEnabled
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
  clusterAnchors: GeoPoint[],
  coordMap: Map<string, GeoPoint>,
): Promise<TripStop> {
  const anchor = clusterAnchors.length
    ? {
        lng: clusterAnchors.reduce((sum, item) => sum + item.lng, 0) / clusterAnchors.length,
        lat: clusterAnchors.reduce((sum, item) => sum + item.lat, 0) / clusterAnchors.length,
      }
    : cityCenter

  if (
    stop.lng != null &&
    stop.lat != null &&
    isCoordPlausible({ lng: stop.lng, lat: stop.lat }, anchor) &&
    isCoordNearCluster({ lng: stop.lng, lat: stop.lat }, clusterAnchors) &&
    !isCoordTooCloseToAny({ lng: stop.lng, lat: stop.lat }, clusterAnchors)
  ) {
    return stop
  }

  const mapped = coordMap.get(stop.name)
  if (
    mapped &&
    isCoordPlausible(mapped, anchor) &&
    isCoordNearCluster(mapped, clusterAnchors) &&
    !isCoordTooCloseToAny(mapped, clusterAnchors)
  ) {
    return { ...stop, ...mapped }
  }

  const city = destination.replace(/(市|县|区)$/, '') || destination
  let point: GeoPoint | null = null

  for (const query of buildPlaceQueries(stop.name, city)) {
    point = await searchPlaceByJs(query, city, anchor, clusterAnchors)
    if (point) {
      break
    }
  }

  if (!point && cityCenter) {
    point = await geocodeCityByJs(
      stop.name.includes(city) ? stop.name : `${city}市${stop.name}`,
    )
    if (
      point &&
      (!isCoordPlausible(point, anchor) ||
        !isCoordNearCluster(point, clusterAnchors))
    ) {
      point = null
    }
  }

  if (!point && anchor) {
    let fallback = fallbackCoordsNear(anchor, stopIndex)
    let guard = 0
    while (isCoordTooCloseToAny(fallback, clusterAnchors) && guard < 6) {
      guard += 1
      fallback = fallbackCoordsNear(anchor, stopIndex + guard)
    }
    point = fallback
  } else if (!point && cityCenter) {
    point = fallbackCoords(cityCenter, 0, stopIndex)
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
  const clusterAnchors: GeoPoint[] = []

  const needsLookup = stops.some(
    (stop) =>
      stop.lng == null ||
      stop.lat == null ||
      !isCoordPlausible({ lng: stop.lng!, lat: stop.lat! }, cityCenter) ||
      !isCoordNearCluster({ lng: stop.lng!, lat: stop.lat! }, clusterAnchors),
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
          if (isCoordPlausible(point, cityCenter)) {
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
      clusterAnchors,
      coordMap,
    )
    resolved.push(stop)
    if (stop.lng != null && stop.lat != null) {
      clusterAnchors.push({ lng: stop.lng, lat: stop.lat })
    }
  }

  return attachDriveSegments(resolved)
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
