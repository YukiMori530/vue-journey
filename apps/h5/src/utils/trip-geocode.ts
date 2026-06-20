import * as geoApi from '../api/geo'
import {
  fallbackCoords,
  geocodeCityByJs,
  searchPlaceByJs,
  type GeoPoint,
} from './amap-geocode'
import type { TripStop } from '../types/trip'

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

function stripDestinationPrefix(name: string, destination: string) {
  const city = destination.replace(/(市|县|区)$/, '')
  return name.replace(new RegExp(`^${city}`), '').trim() || name
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
  dayIndex: number,
  stopIndex: number,
  cityCenter: GeoPoint | null,
  coordMap: Map<string, GeoPoint>,
): Promise<TripStop> {
  if (stop.lng != null && stop.lat != null) {
    return stop
  }

  const mapped = coordMap.get(stop.name)
  if (mapped) {
    return { ...stop, ...mapped }
  }

  const city = destination.replace(/(市|县|区)$/, '') || destination
  let point = await searchPlaceByJs(stop.name, city)

  if (!point) {
    const stripped = stripDestinationPrefix(stop.name, destination)
    if (stripped !== stop.name) {
      point = await searchPlaceByJs(stripped, city)
    }
  }

  if (!point && cityCenter) {
    point = fallbackCoords(cityCenter, dayIndex, stopIndex)
  }

  return point ? { ...stop, ...point } : stop
}

export async function resolveDayStops(
  stops: TripStop[],
  destination: string,
  dayIndex: number,
): Promise<TripStop[]> {
  const missing = stops.filter((stop) => stop.lng == null || stop.lat == null)
  if (!missing.length) {
    return stops
  }
  const coordMap = new Map<string, GeoPoint>()

  if (missing.length > 0 && (await isBackendGeoEnabled())) {
    try {
      const batch = await geoApi.batchGeocode(
        destination,
        missing.map((stop) => stop.name),
      )
      batch.forEach((item) => {
        if (item.lng != null && item.lat != null) {
          coordMap.set(item.name, { lng: item.lng, lat: item.lat })
        }
      })
    } catch {
      // batch failed — per-stop fallback below
    }
  }

  const cityCenter = missing.length > 0 ? await geocodeCityCenter(destination) : null

  return Promise.all(
    stops.map((stop, index) =>
      resolveSingleStop(stop, destination, dayIndex, index, cityCenter, coordMap),
    ),
  )
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
