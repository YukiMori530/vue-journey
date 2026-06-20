<script setup lang="ts">
import { onUnmounted, ref, shallowRef, watch } from 'vue'
import { showToast } from 'vant'
import type { Trip, TripStop } from '../types/trip'
import { enrichDayPlan } from '../utils/enrich-trip-stops'
import { resolveDayStops } from '../utils/trip-geocode'
import { loadAMap } from '../utils/amap'

const props = defineProps<{
  trip: Trip
  day: number
}>()

const mapContainer = ref<HTMLElement | null>(null)
const mapInstance = shallowRef<AMap.Map | null>(null)
const mapMarkers = shallowRef<AMap.Marker[]>([])
const mapPolyline = shallowRef<AMap.Polyline | null>(null)
const dayStops = ref<TripStop[]>([])
const geocoding = ref(false)

function buildMarkerContent(order: number, name: string) {
  return `
    <div class="trip-detail-map-marker">
      <span class="trip-detail-map-marker__num">${order}</span>
      <span class="trip-detail-map-marker__name">${name}</span>
    </div>
  `
}

function clearMapOverlays() {
  mapMarkers.value.forEach((marker) => marker.setMap(null))
  mapMarkers.value = []
  mapPolyline.value?.setMap(null)
  mapPolyline.value = null
}

async function loadDayStops() {
  const dayPlan = props.trip.dayPlans.find((item) => item.day === props.day)
  if (!dayPlan) {
    dayStops.value = []
    return
  }

  geocoding.value = true
  try {
    const enriched = enrichDayPlan(dayPlan, props.trip.destination)
    dayStops.value = await resolveDayStops(enriched.places, props.trip.destination, props.day - 1)
  } finally {
    geocoding.value = false
  }
}

async function renderMap() {
  if (!mapContainer.value || !dayStops.value.length) {
    return
  }

  try {
    await loadAMap(['AMap.Polyline'])

    if (!mapInstance.value) {
      const first = dayStops.value[0]
      mapInstance.value = new AMap.Map(mapContainer.value, {
        zoom: 13,
        center: [first.lng!, first.lat!],
        viewMode: '2D',
        mapStyle: 'amap://styles/normal',
      })
    }

    clearMapOverlays()

    const path: [number, number][] = []

    mapMarkers.value = dayStops.value.map((stop, index) => {
      const position: [number, number] = [stop.lng!, stop.lat!]
      path.push(position)

      const marker = new AMap.Marker({
        position,
        content: buildMarkerContent(index + 1, stop.name),
        offset: new AMap.Pixel(-18, -34),
        zIndex: 100 + index,
      })
      marker.setMap(mapInstance.value!)
      return marker
    })

    if (path.length > 1) {
      mapPolyline.value = new AMap.Polyline({
        path,
        strokeColor: '#1989fa',
        strokeWeight: 5,
        strokeOpacity: 0.9,
        lineJoin: 'round',
        showDir: true,
      })
      mapPolyline.value.setMap(mapInstance.value!)
    }

    mapInstance.value.setFitView(mapMarkers.value, false, [40, 40, 40, 40])
  } catch {
    showToast('地图加载失败')
  }
}

watch(
  () => [props.trip.id, props.day, props.trip.dayPlans],
  async () => {
    await loadDayStops()
    setTimeout(renderMap, 80)
  },
  { immediate: true, deep: true },
)

onUnmounted(() => {
  clearMapOverlays()
  mapInstance.value?.destroy()
  mapInstance.value = null
})
</script>

<template>
  <div class="trip-detail-map-wrap">
    <div ref="mapContainer" class="trip-detail-map" />
    <van-loading v-if="geocoding" class="trip-detail-map__loading" vertical size="20">
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
  background: #1989fa;
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
