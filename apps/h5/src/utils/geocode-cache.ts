import type { GeoPoint } from './geo-distance'

const GEO_CACHE_KEY = 'tuhui:geocode-cache:v2'
const TRIP_STOPS_CACHE_KEY = 'tuhui:trip-stops-cache:v1'
const MAX_GEO_ENTRIES = 600
const MAX_TRIP_ENTRIES = 40

type GeoStore = Record<string, GeoPoint>

type TripStopsEntry = {
  savedAt: number
  days: Array<{
    day: number
    title: string
    stops: Array<Record<string, unknown> & { name: string; lng?: number; lat?: number }>
    totalKm: number
  }>
}

type TripStopsStore = Record<string, TripStopsEntry>

function readGeoStore(): GeoStore {
  try {
    const raw = localStorage.getItem(GEO_CACHE_KEY)
    if (!raw) {
      return {}
    }
    return JSON.parse(raw) as GeoStore
  } catch {
    return {}
  }
}

function writeGeoStore(store: GeoStore) {
  const entries = Object.entries(store)
  const trimmed =
    entries.length > MAX_GEO_ENTRIES
      ? Object.fromEntries(entries.slice(entries.length - MAX_GEO_ENTRIES))
      : store
  try {
    localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(trimmed))
  } catch {
    // quota exceeded
  }
}

function readTripStore(): TripStopsStore {
  try {
    const raw = localStorage.getItem(TRIP_STOPS_CACHE_KEY)
    if (!raw) {
      return {}
    }
    return JSON.parse(raw) as TripStopsStore
  } catch {
    return {}
  }
}

function writeTripStore(store: TripStopsStore) {
  const entries = Object.entries(store).sort((a, b) => b[1].savedAt - a[1].savedAt)
  const trimmed = Object.fromEntries(entries.slice(0, MAX_TRIP_ENTRIES))
  try {
    localStorage.setItem(TRIP_STOPS_CACHE_KEY, JSON.stringify(trimmed))
  } catch {
    // quota exceeded
  }
}

export function geocodeCacheKey(destination: string, name: string): string {
  return `${destination.trim()}::${name.trim()}`
}

export function cityCacheKey(destination: string): string {
  return `city::${destination.trim()}`
}

export function getCachedGeocode(key: string): GeoPoint | null {
  return readGeoStore()[key] ?? null
}

export function setCachedGeocode(key: string, point: GeoPoint) {
  const store = readGeoStore()
  store[key] = point
  writeGeoStore(store)
}

export function getCachedCityCenter(destination: string): GeoPoint | null {
  return getCachedGeocode(cityCacheKey(destination))
}

export function setCachedCityCenter(destination: string, point: GeoPoint) {
  setCachedGeocode(cityCacheKey(destination), point)
}

export function tripStopsCacheKey(
  tripId: number,
  updatedAt: string | undefined,
  destination: string,
): string {
  return `${tripId}:${updatedAt ?? '0'}:${destination.trim()}`
}

export function getCachedTripStops<T>(cacheKey: string): T[] | null {
  const entry = readTripStore()[cacheKey]
  return (entry?.days as T[] | undefined) ?? null
}

export function setCachedTripStops(cacheKey: string, days: unknown[]) {
  const store = readTripStore()
  store[cacheKey] = {
    savedAt: Date.now(),
    days: days as TripStopsEntry['days'],
  }
  writeTripStore(store)
}

/** 批量写入景点坐标到本地缓存，后续进入同页面可秒开 */
export function cacheResolvedStops(
  destination: string,
  stops: Array<{ name: string; lng?: number | null; lat?: number | null }>,
) {
  stops.forEach((stop) => {
    if (stop.lng != null && stop.lat != null) {
      setCachedGeocode(geocodeCacheKey(destination, stop.name), {
        lng: stop.lng,
        lat: stop.lat,
      })
    }
  })
}
