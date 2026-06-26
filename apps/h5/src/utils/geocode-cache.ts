import type { GeoPoint } from './geo-distance'

const CACHE_KEY = 'tuhui:geocode-cache:v1'
const MAX_ENTRIES = 400

type CacheStore = Record<string, GeoPoint>

function readStore(): CacheStore {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) {
      return {}
    }
    return JSON.parse(raw) as CacheStore
  } catch {
    return {}
  }
}

function writeStore(store: CacheStore) {
  const entries = Object.entries(store)
  const trimmed =
    entries.length > MAX_ENTRIES
      ? Object.fromEntries(entries.slice(entries.length - MAX_ENTRIES))
      : store
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(trimmed))
  } catch {
    // quota exceeded — ignore
  }
}

export function getCachedGeocode(key: string): GeoPoint | null {
  return readStore()[key] ?? null
}

export function setCachedGeocode(key: string, point: GeoPoint) {
  const store = readStore()
  store[key] = point
  writeStore(store)
}

export function geocodeCacheKey(destination: string, name: string): string {
  return `${destination.trim()}::${name.trim()}`
}
