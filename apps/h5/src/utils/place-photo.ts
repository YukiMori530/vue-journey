import * as geoApi from '../api/geo'
import { fetchAmapPoiPhoto } from './amap-poi-photo'
import {
  lookupCategoryPhoto,
  lookupDestinationPhoto,
  lookupLocalPoiPhoto,
  primaryPlaceName,
} from './poi-photo-registry'
export { primaryPlaceName } from './poi-photo-registry'
import type { DayPlan, Trip } from '../types/trip'

const photoCache = new Map<string, string | null>()

function cacheKey(name: string, destination: string, category?: string): string {
  return `${destination}::${name}::${category ?? ''}`
}

export async function resolvePlacePhoto(
  name: string,
  destination: string,
  options?: { force?: boolean; category?: string },
): Promise<string | undefined> {
  const category = options?.category
  const key = cacheKey(name, destination, category)
  if (!options?.force && photoCache.has(key)) {
    const cached = photoCache.get(key)
    return cached ?? undefined
  }

  const local = lookupLocalPoiPhoto(name)
  if (local) {
    photoCache.set(key, local)
    return local
  }

  try {
    const remote = await geoApi.fetchPlacePhoto(name, destination, category)
    if (remote) {
      photoCache.set(key, remote)
      return remote
    }
  } catch {
    // 后端不可用时走前端高德
  }

  const amapPhoto = await fetchAmapPoiPhoto(name, destination)
  if (amapPhoto) {
    photoCache.set(key, amapPhoto)
    return amapPhoto
  }

  const categoryPhoto = lookupCategoryPhoto(name, category)
  if (categoryPhoto) {
    photoCache.set(key, categoryPhoto)
    return categoryPhoto
  }

  const destinationPhoto = lookupDestinationPhoto(destination)
  if (destinationPhoto) {
    photoCache.set(key, destinationPhoto)
    return destinationPhoto
  }

  photoCache.set(key, null)
  return undefined
}

export function placePhotoFallbackLabel(name: string): string {
  const primary = primaryPlaceName(name).replace(/[A-Za-z0-9\s]/g, '')
  if (primary.length >= 2) {
    return primary.slice(0, 2)
  }
  return primary.slice(0, 1) || '景'
}

export function placePhotoFallbackHue(name: string, category?: string): number {
  const base = category === 'food' || category === '美食' ? 28 : 258
  let hash = 0
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) | 0
  }
  return (base + (Math.abs(hash) % 36)) % 360
}

export function extractTripStopNames(trip: Trip, limit = 6): string[] {
  const names: string[] = []
  const seen = new Set<string>()

  for (const day of trip.dayPlans) {
    for (const place of day.places) {
      const placeName = typeof place === 'string' ? place : place.name
      const primary = primaryPlaceName(placeName)
      if (!primary || seen.has(primary)) {
        continue
      }
      seen.add(primary)
      names.push(placeName)
      if (names.length >= limit) {
        return names
      }
    }
  }

  return names
}

export function resolveTripCoverStop(
  trip: Trip,
  preferredName?: string | null,
): { name: string; destination: string } {
  const gallery = extractTripStopNames(trip, 6)
  if (preferredName) {
    const preferredPrimary = primaryPlaceName(preferredName)
    const match = gallery.find((name) => primaryPlaceName(name) === preferredPrimary)
    if (match) {
      return { name: match, destination: trip.destination }
    }
  }
  const first = gallery[0]
  return {
    name: first ?? trip.destination,
    destination: trip.destination,
  }
}

export function getTripHeroStop(trip: Trip): { name: string; destination: string } {
  return resolveTripCoverStop(trip)
}

export function extractDayStopNames(day: DayPlan): string[] {
  return day.places.map((place) => (typeof place === 'string' ? place : place.name))
}
