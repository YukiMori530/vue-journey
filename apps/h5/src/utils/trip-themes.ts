export interface TripCardTheme {
  bg: string
  accent: string
}

export const TRIP_CARD_THEMES: TripCardTheme[] = [
  { bg: '#E6E0F3', accent: '#7C5CBF' },
  { bg: '#D1E9E2', accent: '#2D8B6F' },
  { bg: '#FFF0C9', accent: '#C9920A' },
  { bg: '#DCE8F7', accent: '#4A7FC1' },
  { bg: '#FCE4EC', accent: '#C2185B' },
  { bg: '#E8F5E9', accent: '#388E3C' },
]

export function pickTripTheme(seed: number): TripCardTheme {
  return TRIP_CARD_THEMES[Math.abs(seed) % TRIP_CARD_THEMES.length]
}

export function resolveTripCardBg(theme: string, tripId: number): string {
  if (theme.startsWith('#')) {
    return theme
  }
  return pickTripTheme(tripId).bg
}
