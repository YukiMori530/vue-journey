import { request, requestOptional } from './client'

export interface GeoPoint {
  lng: number
  lat: number
}

export interface GeocodedPlace {
  name: string
  lng?: number
  lat?: number
}

export async function fetchGeoStatus() {
  const data = await requestOptional<{ enabled: boolean }>('/api/geo/status')
  return data ?? { enabled: false }
}

export function geocodeCity(keyword: string) {
  return request<GeoPoint | null>(`/api/geo/city?keyword=${encodeURIComponent(keyword)}`)
}

export function batchGeocode(destination: string, places: string[]) {
  return request<GeocodedPlace[]>('/api/geo/batch', {
    method: 'POST',
    body: JSON.stringify({ destination, places }),
  })
}

export function fetchPlacePhoto(name: string, destination: string, category?: string) {
  const params = new URLSearchParams({
    name,
    destination,
  })
  if (category) {
    params.set('category', category)
  }
  return requestOptional<{ url: string | null }>(`/api/geo/place-photo?${params}`).then(
    (data) => data?.url ?? null,
  )
}
