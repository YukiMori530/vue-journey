export interface DayPlan {
  day: number
  places: string[]
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
}
