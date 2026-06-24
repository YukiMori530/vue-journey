import { ref, watch, type Ref } from 'vue'
import type { Trip, TripStop } from '../types/trip'
import { enrichDayPlan } from '../utils/enrich-trip-stops'
import { resolveDayStops } from '../utils/trip-geocode'
import { distanceKm } from '../utils/geo-distance'

export interface ResolvedDayStops {
  day: number
  title: string
  stops: TripStop[]
  totalKm: number
}

function dayRouteKm(stops: TripStop[]): number {
  let total = 0
  for (let index = 1; index < stops.length; index += 1) {
    const prev = stops[index - 1]
    const curr = stops[index]
    if (prev.lng != null && prev.lat != null && curr.lng != null && curr.lat != null) {
      total += distanceKm(
        { lng: prev.lng, lat: prev.lat },
        { lng: curr.lng, lat: curr.lat },
      )
    }
  }
  return Number(total.toFixed(1))
}

export function useResolvedTripStops(trip: Ref<Trip | undefined>) {
  const days = ref<ResolvedDayStops[]>([])
  const loading = ref(false)

  watch(
    () =>
      [
        trip.value?.id,
        trip.value?.updatedAt,
        trip.value?.placeCount,
        trip.value?.title,
        JSON.stringify(trip.value?.dayPlans),
      ] as const,
    async () => {
      const current = trip.value
      if (!current?.dayPlans.length) {
        days.value = []
        return
      }

      loading.value = true
      try {
        const resolved: ResolvedDayStops[] = []
        for (let dayIndex = 0; dayIndex < current.dayPlans.length; dayIndex += 1) {
          const dayPlan = current.dayPlans[dayIndex]
          const enriched = enrichDayPlan(dayPlan, current.destination)
          const stops = await resolveDayStops(
            enriched.places,
            current.destination,
            dayIndex,
          )
          resolved.push({
            day: dayPlan.day,
            title: enriched.title,
            stops,
            totalKm: dayRouteKm(stops),
          })
        }
        days.value = resolved
      } finally {
        loading.value = false
      }
    },
    { immediate: true, deep: true },
  )

  return { days, loading }
}
