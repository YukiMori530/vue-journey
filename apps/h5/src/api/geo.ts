import { request } from './client'

export interface GeoPoint {
  lng: number
  lat: number
}

export interface GeocodedPlace {
  name: string
  lng?: number
  lat?: number
}

export function fetchGeoStatus() {
  return request<{ enabled: boolean }>('/api/geo/status')
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
