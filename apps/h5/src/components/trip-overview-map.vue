<script setup lang="ts">
import { computed, onUnmounted, ref, shallowRef, watch } from 'vue'
import type { ResolvedDayStops } from '../composables/use-resolved-trip-stops'
import { buildRouteSegments } from '../utils/amap-route'
import { getDayColor } from '../utils/day-route-colors'
import { loadAMap } from '../utils/amap'
import { defaultCityCenter } from '../utils/geo-distance'
import { geocodeCityCenter } from '../utils/trip-geocode'
import {
  buildOverviewDayBadgeHtml,
  buildRoutePolylineOptions,
  buildTripMapMarkerHtml,
  TRIP_MAP_DAY_BADGE_OFFSET,
  TRIP_MAP_MARKER_OFFSET,
  TRIP_MAP_STYLE,
} from '../utils/map-marker'

const props = defineProps<{
  days: ResolvedDayStops[]
  destination?: string
  highlightDay?: number | null
  loading?: boolean
}>()

const mapContainer = ref<HTMLElement | null>(null)
const mapInstance = shallowRef<AMap.Map | null>(null)
const mapMarkers = shallowRef<AMap.Marker[]>([])
const mapPolylines = shallowRef<AMap.Polyline[]>([])

let renderSeq = 0
let renderTimer: ReturnType<typeof setTimeout> | null = null

const visibleDays = computed(() => {
  if (props.highlightDay != null) {
    return props.days.filter((day) => day.day === props.highlightDay)
  }
  return props.days
})

function clearMapOverlays() {
  mapMarkers.value.forEach((marker) => marker.setMap(null))
  mapMarkers.value = []
  mapPolylines.value.forEach((line) => line.setMap(null))
  mapPolylines.value = []
}

async function renderMap() {
  const seq = ++renderSeq
  if (!mapContainer.value || !visibleDays.value.length) {
    return
  }

  try {
    await loadAMap(['AMap.Polyline'])
    if (seq !== renderSeq) {
      return
    }

    if (!mapInstance.value) {
      const firstStop = visibleDays.value[0]?.stops.find(
        (stop) => stop.lng != null && stop.lat != null,
      )
      let center: [number, number]
      if (firstStop) {
        center = [firstStop.lng!, firstStop.lat!]
      } else if (props.destination) {
        const geocoded = await geocodeCityCenter(props.destination)
        const fallback = defaultCityCenter(props.destination)
        center = geocoded
          ? [geocoded.lng, geocoded.lat]
          : [fallback.lng, fallback.lat]
      } else {
        center = [116.397, 39.903]
      }
      mapInstance.value = new AMap.Map(mapContainer.value, {
        zoom: 12,
        center,
        viewMode: '2D',
        mapStyle: TRIP_MAP_STYLE,
      })
    }

    clearMapOverlays()
    const markers: AMap.Marker[] = []
    const polylines: AMap.Polyline[] = []

    for (const dayPlan of visibleDays.value) {
      const located = dayPlan.stops.filter((stop) => stop.lng != null && stop.lat != null)
      if (!located.length) {
        continue
      }

      located.forEach((stop, index) => {
        const marker = new AMap.Marker({
          position: [stop.lng!, stop.lat!],
          content: buildTripMapMarkerHtml(index + 1, stop.name, getDayColor(dayPlan.day)),
          offset: new AMap.Pixel(TRIP_MAP_MARKER_OFFSET.x, TRIP_MAP_MARKER_OFFSET.y),
          zIndex: 100 + dayPlan.day * 10 + index,
        })
        marker.setMap(mapInstance.value!)
        markers.push(marker)
      })

      if (props.highlightDay == null && located[0]) {
        const badge = new AMap.Marker({
          position: [located[0].lng!, located[0].lat!],
          content: buildOverviewDayBadgeHtml(dayPlan.day, dayPlan.totalKm, getDayColor(dayPlan.day)),
          offset: new AMap.Pixel(TRIP_MAP_DAY_BADGE_OFFSET.x, TRIP_MAP_DAY_BADGE_OFFSET.y),
          zIndex: 200 + dayPlan.day,
        })
        badge.setMap(mapInstance.value!)
        markers.push(badge)
      }

      const segments = await buildRouteSegments(
        located as Array<{ lng: number; lat: number }>,
        props.destination,
      )
      if (seq !== renderSeq) {
        clearMapOverlays()
        return
      }

      const color = getDayColor(dayPlan.day)
      for (const path of segments) {
        if (path.length <= 1) {
          continue
        }
        const polyline = new AMap.Polyline({
          path,
          ...buildRoutePolylineOptions(color, props.highlightDay != null),
        })
        polyline.setMap(mapInstance.value!)
        polylines.push(polyline)
      }
    }

    mapMarkers.value = markers
    mapPolylines.value = polylines

    if (markers.length) {
      mapInstance.value.setFitView(markers, false, [56, 56, 56, 56])
    }
  } catch {
    // ignore map errors
  }
}

function scheduleRender() {
  if (renderTimer) {
    clearTimeout(renderTimer)
  }
  renderTimer = setTimeout(() => {
    renderTimer = null
    renderMap()
  }, 80)
}

watch(
  () => [props.days, props.highlightDay, props.destination],
  scheduleRender,
  { immediate: true, deep: true },
)

onUnmounted(() => {
  renderSeq += 1
  if (renderTimer) {
    clearTimeout(renderTimer)
  }
  clearMapOverlays()
  mapInstance.value?.destroy()
  mapInstance.value = null
})
</script>

<template>
  <div class="trip-overview-map-wrap">
    <div ref="mapContainer" class="trip-overview-map" />
    <van-loading v-if="loading" class="trip-overview-map__loading" vertical size="20">
      定位中…
    </van-loading>
  </div>
</template>

<style scoped>
.trip-overview-map-wrap {
  position: relative;
  width: 100%;
  height: 100%;
}

.trip-overview-map {
  width: 100%;
  height: 100%;
  background: #eef1f5;
}

.trip-overview-map__loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(255 255 255 / 55%);
}
</style>
