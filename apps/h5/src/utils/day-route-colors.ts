export const DAY_ROUTE_COLORS = ['#1989fa', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444']

export function getDayColor(day: number): string {
  return DAY_ROUTE_COLORS[(day - 1) % DAY_ROUTE_COLORS.length]
}

export function getDayMarkerColor(day: number): string {
  return getDayColor(day)
}
