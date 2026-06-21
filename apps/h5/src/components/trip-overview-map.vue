<script setup lang="ts">
import { computed, onUnmounted, ref, shallowRef, watch } from 'vue'
import type { ResolvedDayStops } from '../composables/use-resolved-trip-stops'
import { buildRouteSegments } from '../utils/amap-route'
import { getDayColor } from '../utils/day-route-colors'
import { loadAMap } from '../utils/amap'

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

function buildMarkerContent(order: number, name: string, day: number) {
  const color = getDayColor(day)
  return `
    <div class="trip-detail-map-marker">
      <span class="trip-detail-map-marker__num" style="background:${color}">${order}</span>
      <span class="trip-detail-map-marker__name">${name}</span>
    </div>
  `
}

function buildDayBadge(day: number, totalKm: number) {
  const color = getDayColor(day)
  return `
    <div class="trip-overview-day-badge" style="background:${color}">
      <span>DAY ${day}</span>
      <strong>${totalKm} km</strong>
    </div>
  `
}

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
      mapInstance.value = new AMap.Map(mapContainer.value, {
        zoom: 12,
        center: firstStop ? [firstStop.lng!, firstStop.lat!] : [120.38, 36.07],
        viewMode: '2D',
        mapStyle: 'amap://styles/normal',
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
          content: buildMarkerContent(index + 1, stop.name, dayPlan.day),
          offset: new AMap.Pixel(-18, -34),
          zIndex: 100 + dayPlan.day * 10 + index,
        })
        marker.setMap(mapInstance.value!)
        markers.push(marker)
      })

      if (props.highlightDay == null && located[0]) {
        const badge = new AMap.Marker({
          position: [located[0].lng!, located[0].lat!],
          content: buildDayBadge(dayPlan.day, dayPlan.totalKm),
          offset: new AMap.Pixel(-36, -72),
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
          strokeColor: color,
          strokeWeight: props.highlightDay != null ? 5 : 4,
          strokeOpacity: 0.92,
          lineJoin: 'round',
          lineCap: 'round',
          showDir: true,
        })
        polyline.setMap(mapInstance.value!)
        polylines.push(polyline)
      }
    }

    mapMarkers.value = markers
    mapPolylines.value = polylines

    if (markers.length) {
      mapInstance.value.setFitView(markers, false, [48, 48, 48, 48])
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
  background: #e8edf2;
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

<style>
.trip-overview-day-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 72px;
  padding: 6px 10px;
  border: 2px solid #fff;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  box-shadow: 0 2px 10px rgb(0 0 0 / 18%);
}

.trip-overview-day-badge strong {
  margin-top: 2px;
  font-size: 11px;
}
</style>
