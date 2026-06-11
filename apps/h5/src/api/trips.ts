import { request } from './client'
import type { CreateTripInput, DayPlan, Trip } from '../types/trip'

export type CreateTripPayload = CreateTripInput & {
  title?: string
  nights?: string
  placeCount?: number
  cover?: string
  theme?: string
  dayPlans?: DayPlan[]
}

export function fetchTrips() {
  return request<Trip[]>('/api/trips')
}

export function fetchTrip(id: number) {
  return request<Trip>(`/api/trips/${id}`)
}

export function createTrip(payload: CreateTripPayload) {
  return request<Trip>('/api/trips', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function importTrip(text: string) {
  return request<Trip>('/api/trips/import', {
    method: 'POST',
    body: JSON.stringify({ text }),
  })
}

export function deleteTrip(id: number) {
  return request<Trip>(`/api/trips/${id}`, {
    method: 'DELETE',
  })
}
