import { ref, watch, type Ref } from 'vue'
import type { Trip, TripStop } from '../types/trip'
import { enrichDayPlan } from '../utils/enrich-trip-stops'
import { enrichStopsDriveMetrics, sumStopRouteKm } from '../utils/amap-route'
import { resolveDayStops } from '../utils/trip-geocode'

export interface ResolvedDayStops {
  day: number
  title: string
  stops: TripStop[]
  totalKm: number
}

const DAY_RESOLVE_TIMEOUT_MS = 18_000

function dayRouteKm(stops: TripStop[]): number {
  return sumStopRouteKm(stops)
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      setTimeout(() => resolve(fallback), ms)
    }),
  ])
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
          const stops = await withTimeout(
            resolveDayStops(enriched.places, current.destination, dayIndex),
            DAY_RESOLVE_TIMEOUT_MS,
            enriched.places,
          )
          let withDrive = stops
          try {
            withDrive = await withTimeout(
              enrichStopsDriveMetrics(stops),
              10_000,
              stops,
            )
          } catch {
            // 高德不可用时保留直线估算
          }
          resolved.push({
            day: dayPlan.day,
            title: enriched.title,
            stops: withDrive,
            totalKm: dayRouteKm(withDrive),
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
