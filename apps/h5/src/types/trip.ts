export interface TripStop {
  name: string
  lng?: number
  lat?: number
  category?: string
  categoryLabel?: string
  duration?: number
  tips?: string
  description?: string
  cover?: string
  startTime?: string
  endTime?: string
  distanceKm?: number
  driveMinutes?: number
}

export interface DayPlan {
  day: number
  title?: string
  places: Array<string | TripStop>
}

export interface Trip {
  id: number
  destination: string
  days: number
  preferences: string[]
  title: string
  nights: string
  placeCount: number
  cover: string
  theme: string
  dayPlans: DayPlan[]
}

export type CreateTripInput = {
  destination: string
  days: number
  preferences: string[]
  rawQuery?: string
}

export function normalizeStop(raw: string | TripStop): TripStop {
  if (typeof raw === 'string') {
    return { name: raw }
  }
  return raw
}

export function normalizeDayPlan(day: DayPlan): { day: number; places: TripStop[] } {
  return {
    day: day.day,
    places: day.places.map(normalizeStop),
  }
}
