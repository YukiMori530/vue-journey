<script setup lang="ts">
import { onUnmounted, ref, shallowRef, watch } from 'vue'
import { loadAMap } from '../utils/amap'
import type { GeneratingMapStop } from '../utils/plan-generation-script'

const props = defineProps<{
  center: [number, number]
  stops: GeneratingMapStop[]
}>()

const mapContainer = ref<HTMLElement | null>(null)
const mapInstance = shallowRef<AMap.Map | null>(null)
const mapMarkers = shallowRef<AMap.Marker[]>([])
const mapPolyline = shallowRef<AMap.Polyline | null>(null)

function buildMarkerContent(stop: GeneratingMapStop) {
  return `
    <div class="plan-gen-map-marker">
      <span class="plan-gen-map-marker__day">Day${stop.day}</span>
      <span class="plan-gen-map-marker__num">${stop.order}</span>
      <span class="plan-gen-map-marker__name">${stop.name}</span>
    </div>
  `
}

function clearMapOverlays() {
  mapMarkers.value.forEach((marker) => marker.setMap(null))
  mapMarkers.value = []
  mapPolyline.value?.setMap(null)
  mapPolyline.value = null
}

async function renderMap() {
  if (!mapContainer.value) {
    return
  }

  try {
    await loadAMap(['AMap.Polyline'])

    if (!mapInstance.value) {
      mapInstance.value = new AMap.Map(mapContainer.value, {
        zoom: 11,
        center: props.center,
        viewMode: '2D',
        mapStyle: 'amap://styles/normal',
      })
    }

    clearMapOverlays()

    if (!props.stops.length) {
      mapInstance.value.setCenter(props.center)
      return
    }

    const path: [number, number][] = []

    mapMarkers.value = props.stops.map((stop) => {
      const position: [number, number] = [stop.lng, stop.lat]
      path.push(position)

      const marker = new AMap.Marker({
        position,
        content: buildMarkerContent(stop),
        offset: new AMap.Pixel(-22, -42),
        zIndex: 100 + stop.order,
      })
      marker.setMap(mapInstance.value!)
      return marker
    })

    if (path.length > 1) {
      mapPolyline.value = new AMap.Polyline({
        path,
        strokeColor: '#14b8a6',
        strokeWeight: 6,
        strokeOpacity: 0.92,
        lineJoin: 'round',
        showDir: true,
      })
      mapPolyline.value.setMap(mapInstance.value!)
    }

    mapInstance.value.setFitView(mapMarkers.value, false, [48, 48, 48, 48])
  } catch {
    // map key missing — keep gray placeholder
  }
}

watch(
  () => [props.center, props.stops],
  () => setTimeout(renderMap, 60),
  { deep: true, immediate: true },
)

onUnmounted(() => {
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
  background: #e8edf2;
}
</style>

<style>
.plan-gen-map-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 72px;
  text-align: center;
}

.plan-gen-map-marker__day {
  margin-bottom: 2px;
  padding: 1px 6px;
  border-radius: 6px;
  background: #14b8a6;
  font-size: 9px;
  font-weight: 700;
  color: #fff;
}

.plan-gen-map-marker__num {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 2px solid #fff;
  border-radius: 50%;
  background: #1989fa;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  box-shadow: 0 2px 8px rgb(25 137 250 / 35%);
}

.plan-gen-map-marker__name {
  margin-top: 4px;
  padding: 2px 6px;
  border-radius: 8px;
  background: rgb(255 255 255 / 95%);
  font-size: 10px;
  color: #323233;
}
</style>
