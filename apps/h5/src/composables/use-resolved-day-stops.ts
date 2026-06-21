import { ref, watch, type Ref } from 'vue'
import type { Trip, TripStop } from '../types/trip'
import { enrichDayPlan } from '../utils/enrich-trip-stops'
import { resolveDayStops } from '../utils/trip-geocode'

export function useResolvedDayStops(trip: Ref<Trip | undefined>, day: Ref<number>) {
  const stops = ref<TripStop[]>([])
  const loading = ref(false)

  watch(
    () => [trip.value?.id, day.value, trip.value?.dayPlans] as const,
    async () => {
      const currentTrip = trip.value
      if (!currentTrip) {
        stops.value = []
        return
      }

      const dayPlan = currentTrip.dayPlans.find((item) => item.day === day.value)
      if (!dayPlan) {
        stops.value = []
        return
      }

      loading.value = true
      try {
        const enriched = enrichDayPlan(dayPlan, currentTrip.destination)
        stops.value = await resolveDayStops(
          enriched.places,
          currentTrip.destination,
          day.value - 1,
        )
      } finally {
        loading.value = false
      }
    },
    { immediate: true, deep: true },
  )

  return { stops, loading }
}
