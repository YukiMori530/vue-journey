<script setup lang="ts">
import { onUnmounted, ref, shallowRef, watch } from 'vue'
import { showToast } from 'vant'
import type { TripStop } from '../types/trip'
import { buildRouteSegments } from '../utils/amap-route'
import { getDayColor } from '../utils/day-route-colors'
import { loadAMap } from '../utils/amap'

const props = defineProps<{
  day: number
  stops: TripStop[]
  destination?: string
  loading?: boolean
}>()

const mapContainer = ref<HTMLElement | null>(null)
const mapInstance = shallowRef<AMap.Map | null>(null)
const mapMarkers = shallowRef<AMap.Marker[]>([])
const mapPolylines = shallowRef<AMap.Polyline[]>([])

let renderSeq = 0
let renderTimer: ReturnType<typeof setTimeout> | null = null

function buildMarkerContent(order: number, name: string, day: number) {
  const color = getDayColor(day)
  return `
    <div class="trip-detail-map-marker">
      <span class="trip-detail-map-marker__num" style="background:${color}">${order}</span>
      <span class="trip-detail-map-marker__name">${name}</span>
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

  if (!mapContainer.value || !props.stops.length) {
    return
  }

  const located = props.stops.filter((stop) => stop.lng != null && stop.lat != null)
  if (!located.length) {
    return
  }

  try {
    await loadAMap(['AMap.Polyline'])
    if (seq !== renderSeq) {
      return
    }

    if (!mapInstance.value) {
      const first = located[0]
      mapInstance.value = new AMap.Map(mapContainer.value, {
        zoom: 13,
        center: [first.lng!, first.lat!],
        viewMode: '2D',
        mapStyle: 'amap://styles/normal',
      })
    }

    clearMapOverlays()

    mapMarkers.value = located.map((stop, index) => {
      const position: [number, number] = [stop.lng!, stop.lat!]
      const marker = new AMap.Marker({
        position,
        content: buildMarkerContent(index + 1, stop.name, props.day),
        offset: new AMap.Pixel(-18, -34),
        zIndex: 100 + index,
      })
      marker.setMap(mapInstance.value!)
      return marker
    })

    const segments = await buildRouteSegments(
      located as Array<{ lng: number; lat: number }>,
      props.destination,
    )
    if (seq !== renderSeq) {
      clearMapOverlays()
      return
    }

    const color = getDayColor(props.day)
    mapPolylines.value = segments.map((path) => {
      const polyline = new AMap.Polyline({
        path,
        strokeColor: color,
        strokeWeight: 5,
        strokeOpacity: 0.9,
        lineJoin: 'round',
        lineCap: 'round',
        showDir: true,
      })
      polyline.setMap(mapInstance.value!)
      return polyline
    })

    mapInstance.value.setFitView(mapMarkers.value, false, [40, 40, 40, 40])
  } catch {
    if (seq === renderSeq) {
      showToast('地图加载失败')
    }
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
  () => [props.day, props.stops, props.destination],
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
  <div class="trip-detail-map-wrap">
    <div ref="mapContainer" class="trip-detail-map" />
    <van-loading v-if="loading" class="trip-detail-map__loading" vertical size="20">
      定位中…
    </van-loading>
  </div>
</template>

<style scoped>
.trip-detail-map-wrap {
  position: relative;
  width: 100%;
  height: 100%;
}

.trip-detail-map {
  width: 100%;
  height: 100%;
  background: #e8edf2;
}

.trip-detail-map__loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(255 255 255 / 55%);
}
</style>

<style>
.trip-detail-map-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 64px;
  text-align: center;
}

.trip-detail-map-marker__num {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: 2px solid #fff;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  box-shadow: 0 2px 8px rgb(25 137 250 / 35%);
}

.trip-detail-map-marker__name {
  margin-top: 4px;
  padding: 2px 6px;
  border-radius: 8px;
  background: rgb(255 255 255 / 95%);
  font-size: 10px;
  color: #323233;
}
</style>
