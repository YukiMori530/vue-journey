import { request } from './client'
import type { CreateTripInput, Trip } from '../types/trip'

export function planTrip(input: CreateTripInput) {
  return request<Trip>('/api/ai/plan', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function importGuide(text: string) {
  return request<Trip>('/api/ai/import', {
    method: 'POST',
    body: JSON.stringify({ text }),
  })
}
