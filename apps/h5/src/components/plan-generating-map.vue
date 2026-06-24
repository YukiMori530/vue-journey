<script setup lang="ts">
import { onUnmounted, ref, shallowRef, watch } from 'vue'
import { loadAMap } from '../utils/amap'
import { buildRouteSegments } from '../utils/amap-route'
import { getDayColor } from '../utils/day-route-colors'
import type { GeneratingMapStop } from '../utils/plan-generation-script'
import {
  buildGeneratingMapMarkerHtml,
  buildRoutePolylineOptions,
  TRIP_MAP_MARKER_OFFSET,
  TRIP_MAP_STYLE,
} from '../utils/map-marker'

const props = defineProps<{
  center: [number, number]
  stops: GeneratingMapStop[]
  destination?: string
}>()

const mapContainer = ref<HTMLElement | null>(null)
const mapInstance = shallowRef<AMap.Map | null>(null)
const mapMarkers = shallowRef<AMap.Marker[]>([])
const mapPolylines = shallowRef<AMap.Polyline[]>([])

let renderSeq = 0
let renderTimer: ReturnType<typeof setTimeout> | null = null

function clearMapOverlays() {
  mapMarkers.value.forEach((marker) => marker.setMap(null))
  mapMarkers.value = []
  mapPolylines.value.forEach((line) => line.setMap(null))
  mapPolylines.value = []
}

async function renderMap() {
  const seq = ++renderSeq

  if (!mapContainer.value) {
    return
  }

  try {
    await loadAMap(['AMap.Polyline'])
    if (seq !== renderSeq) {
      return
    }

    if (!mapInstance.value) {
      mapInstance.value = new AMap.Map(mapContainer.value, {
        zoom: 11,
        center: props.center,
        viewMode: '2D',
        mapStyle: TRIP_MAP_STYLE,
      })
    }

    clearMapOverlays()

    if (!props.stops.length) {
      mapInstance.value.setCenter(props.center)
      return
    }

    mapMarkers.value = props.stops.map((stop) => {
      const position: [number, number] = [stop.lng, stop.lat]
      const marker = new AMap.Marker({
        position,
        content: buildGeneratingMapMarkerHtml(stop, getDayColor(stop.day)),
        offset: new AMap.Pixel(TRIP_MAP_MARKER_OFFSET.x, TRIP_MAP_MARKER_OFFSET.y),
        zIndex: 100 + stop.order,
      })
      marker.setMap(mapInstance.value!)
      return marker
    })

    const dayGroups = new Map<number, GeneratingMapStop[]>()
    props.stops.forEach((stop) => {
      const group = dayGroups.get(stop.day) ?? []
      group.push(stop)
      dayGroups.set(stop.day, group)
    })

    const polylines: AMap.Polyline[] = []
    for (const [day, group] of dayGroups) {
      const sorted = [...group].sort((a, b) => a.order - b.order)
      if (sorted.length < 2) {
        continue
      }
      const segments = await buildRouteSegments(sorted, props.destination)
      if (seq !== renderSeq) {
        clearMapOverlays()
        return
      }
      for (const path of segments) {
        if (path.length <= 1) {
          continue
        }
        const polyline = new AMap.Polyline({
          path,
          ...buildRoutePolylineOptions(getDayColor(day), true),
        })
        polyline.setMap(mapInstance.value!)
        polylines.push(polyline)
      }
    }
    mapPolylines.value = polylines

    mapInstance.value.setFitView(mapMarkers.value, false, [56, 56, 56, 56])
  } catch {
    // map key missing — keep gray placeholder
  }
}

function scheduleRender() {
  if (renderTimer) {
    clearTimeout(renderTimer)
  }
  renderTimer = setTimeout(() => {
    renderTimer = null
    renderMap()
  }, 60)
}

watch(
  () => [props.center, props.stops, props.destination],
  scheduleRender,
  { deep: true, immediate: true },
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
  <div ref="mapContainer" class="plan-gen-map" />
</template>

<style scoped>
.plan-gen-map {
  width: 100%;
  height: 100%;
  background: #eef1f5;
}
</style>
