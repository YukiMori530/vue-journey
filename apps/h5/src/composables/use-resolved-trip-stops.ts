import { ref, watch, type Ref } from 'vue'
import type { Trip, TripStop } from '../types/trip'
import { enrichDayPlan } from '../utils/enrich-trip-stops'
import { enrichStopsDriveMetrics, sumStopRouteKm } from '../utils/amap-route'
import {
  cacheResolvedStops,
  getCachedTripStops,
  setCachedTripStops,
  tripStopsCacheKey,
} from '../utils/geocode-cache'
import { resolveDayStops } from '../utils/trip-geocode'

export interface ResolvedDayStops {
  day: number
  title: string
  stops: TripStop[]
  totalKm: number
}

const DAY_RESOLVE_TIMEOUT_MS = 14_000

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

async function resolveDay(
  trip: Trip,
  dayIndex: number,
): Promise<ResolvedDayStops> {
  const dayPlan = trip.dayPlans[dayIndex]
  const enriched = enrichDayPlan(dayPlan, trip.destination)
  const stops = await withTimeout(
    resolveDayStops(enriched.places, trip.destination, dayIndex),
    DAY_RESOLVE_TIMEOUT_MS,
    enriched.places,
  )
  return {
    day: dayPlan.day,
    title: enriched.title,
    stops,
    totalKm: dayRouteKm(stops),
  }
}

function allStopsLocated(days: ResolvedDayStops[]): boolean {
  return days.every((day) =>
    day.stops.every((stop) => stop.lng != null && stop.lat != null),
  )
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

      const cacheKey = tripStopsCacheKey(
        current.id,
        current.updatedAt,
        current.destination,
      )
      const cached = getCachedTripStops<ResolvedDayStops>(cacheKey)
      if (cached?.length) {
        days.value = cached
        loading.value = false
        if (allStopsLocated(cached)) {
          return
        }
      } else {
        loading.value = true
      }

      try {
        const resolved = await Promise.all(
          current.dayPlans.map((_day, dayIndex) => resolveDay(current, dayIndex)),
        )
        days.value = resolved
        setCachedTripStops(cacheKey, resolved)
        resolved.forEach((day) => cacheResolvedStops(current.destination, day.stops))

        void Promise.all(
          resolved.map(async (day, index) => {
            try {
              const withDrive = await withTimeout(
                enrichStopsDriveMetrics(day.stops),
                8_000,
                day.stops,
              )
              if (days.value[index]?.day === day.day) {
                const next = {
                  ...day,
                  stops: withDrive,
                  totalKm: dayRouteKm(withDrive),
                }
                days.value[index] = next
                const snapshot = [...days.value]
                setCachedTripStops(cacheKey, snapshot)
              }
            } catch {
              // 保留已定位坐标
            }
          }),
        )
      } finally {
        loading.value = false
      }
    },
    { immediate: true, deep: true },
  )

  return { days, loading }
}
