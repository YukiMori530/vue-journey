<script setup lang="ts">
import { computed, onUnmounted, ref, shallowRef, watch } from 'vue'
import { showToast } from 'vant'
import type { Trip, TripStop } from '../types/trip'
import { normalizeDayPlan } from '../types/trip'
import { resolveDayStops } from '../utils/trip-geocode'
import { loadAMap } from '../utils/amap'

const props = defineProps<{
  trip: Trip
}>()

const selectedDay = ref<number | 'all'>('all')
const mapContainer = ref<HTMLElement | null>(null)
const mapInstance = shallowRef<AMap.Map | null>(null)
const mapMarkers = shallowRef<AMap.Marker[]>([])
const mapPolyline = shallowRef<AMap.Polyline | null>(null)
const mapLoading = ref(true)
const resolvedDays = ref<Array<{ day: number; places: TripStop[] }>>([])

async function loadResolvedDays() {
  mapLoading.value = true
  const days = props.trip.dayPlans.map((day) => normalizeDayPlan(day))
  const next: Array<{ day: number; places: TripStop[] }> = []

  for (let index = 0; index < days.length; index += 1) {
    const day = days[index]
    const places = await resolveDayStops(day.places, props.trip.destination, index)
    next.push({ day: day.day, places })
  }

  resolvedDays.value = next
}

const dayTabs = computed((): Array<{ value: number | 'all'; label: string }> => {
  const tabs = resolvedDays.value.map((day) => ({
    value: day.day as number | 'all',
    label: `DAY ${day.day}`,
  }))
  if (resolvedDays.value.length > 1) {
    tabs.push({ value: 'all', label: '全部' })
  }
  return tabs
})

const visibleStops = computed(() => {
  if (selectedDay.value === 'all') {
    return resolvedDays.value.flatMap((day) =>
      day.places.map((stop, index) => ({
        ...stop,
        day: day.day,
        order: index + 1,
      })),
    )
  }
  const day = resolvedDays.value.find((item) => item.day === selectedDay.value)
  return (
    day?.places.map((stop, index) => ({
      ...stop,
      day: day.day,
      order: index + 1,
    })) ?? []
  )
})

function buildMarkerContent(stop: { name: string; order: number; day: number }, index: number) {
  const label = selectedDay.value === 'all' ? `${stop.day}-${stop.order}` : String(stop.order)
  return `
    <div class="trip-map-marker">
      <span class="trip-map-marker__num">${label}</span>
      <span class="trip-map-marker__name">${stop.name}</span>
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
  if (!mapContainer.value || !visibleStops.value.length) {
    mapLoading.value = false
    return
  }

  try {
    await loadAMap(['AMap.Polyline'])

    if (!mapInstance.value) {
      const first = visibleStops.value[0]
      mapInstance.value = new AMap.Map(mapContainer.value, {
        zoom: 12,
        center: [first.lng!, first.lat!],
        viewMode: '2D',
        mapStyle: 'amap://styles/normal',
      })
      mapInstance.value.add(new AMap.Scale({ position: 'LB' }))
    }

    clearMapOverlays()

    const path: [number, number][] = []

    mapMarkers.value = visibleStops.value.map((stop, index) => {
      const position: [number, number] = [stop.lng!, stop.lat!]
      path.push(position)

      const marker = new AMap.Marker({
        position,
        content: buildMarkerContent(stop, index),
        offset: new AMap.Pixel(-20, -36),
        zIndex: 100 + index,
      })
      marker.setMap(mapInstance.value!)
      return marker
    })

    if (path.length > 1) {
      mapPolyline.value = new AMap.Polyline({
        path,
        strokeColor: '#111',
        strokeWeight: 4,
        strokeOpacity: 0.85,
        lineJoin: 'round',
        lineCap: 'round',
        showDir: true,
      })
      mapPolyline.value.setMap(mapInstance.value!)
    }

    mapInstance.value.setFitView(mapMarkers.value, false, [48, 48, 48, 48])
  } catch {
    showToast('地图加载失败，请检查高德 Key')
  } finally {
    mapLoading.value = false
  }
}

function selectDay(day: number | 'all') {
  selectedDay.value = day
}

watch(
  resolvedDays,
  (days) => {
    if (days.length === 1) {
      selectedDay.value = days[0].day
    }
  },
  { immediate: true },
)

watch(
  () => [props.trip.id, props.trip.dayPlans],
  async () => {
    await loadResolvedDays()
    setTimeout(renderMap, 80)
  },
  { immediate: true, deep: true },
)

watch(
  () => [selectedDay.value, visibleStops.value.length],
  () => {
    setTimeout(renderMap, 80)
  },
)

onUnmounted(() => {
  clearMapOverlays()
  mapInstance.value?.destroy()
  mapInstance.value = null
})
</script>

<template>
  <div class="trip-map-panel">
    <div v-if="resolvedDays.length" class="day-tabs">
      <button
        v-for="tab in dayTabs"
        :key="tab.label"
        type="button"
        class="day-tab"
        :class="{ active: selectedDay === tab.value }"
        @click="selectDay(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="!resolvedDays.length" class="map-empty">
      <p>还没有地点，先用 AI 生成或从小红书导入行程</p>
    </div>

    <template v-else>
      <div ref="mapContainer" class="trip-map" />
      <van-loading v-if="mapLoading" class="map-loading" vertical>地图加载中...</van-loading>

      <ol class="stop-list">
        <li v-for="(stop, index) in visibleStops" :key="`${stop.day}-${stop.name}-${index}`">
          <span class="stop-num">{{ selectedDay === 'all' ? `${stop.day}-${stop.order}` : stop.order }}</span>
          <div>
            <p class="stop-name">{{ stop.name }}</p>
            <p v-if="stop.category" class="stop-meta">{{ stop.category }}</p>
          </div>
        </li>
      </ol>
    </template>
  </div>
</template>

<style scoped>
.trip-map-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.day-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
}

.day-tabs::-webkit-scrollbar {
  display: none;
}

.day-tab {
  flex-shrink: 0;
  padding: 8px 14px;
  border: none;
  border-radius: 999px;
  background: #f2f3f5;
  font-size: 13px;
  font-weight: 600;
  color: #646566;
  cursor: pointer;
}

.day-tab.active {
  background: #111;
  color: #fff;
}

.trip-map {
  height: 320px;
  overflow: hidden;
  border-radius: 18px;
  background: #eef2f6;
}

.map-loading {
  position: absolute;
  inset: auto 0 120px;
  display: flex;
  justify-content: center;
}

.map-empty {
  padding: 48px 16px;
  border-radius: 18px;
  background: #f7f8fa;
  text-align: center;
}

.map-empty p {
  margin: 0;
  font-size: 14px;
  color: #969799;
}

.stop-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.stop-list li {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #f2f3f5;
}

.stop-num {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #111;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.stop-name {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 600;
  color: #111;
}

.stop-meta {
  margin: 0;
  font-size: 12px;
  color: #969799;
}
</style>

<style>
.trip-map-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 72px;
  text-align: center;
}

.trip-map-marker__num {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 2px solid #fff;
  border-radius: 50%;
  background: #111;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  box-shadow: 0 2px 8px rgb(0 0 0 / 20%);
}

.trip-map-marker__name {
  margin-top: 4px;
  padding: 2px 6px;
  border-radius: 8px;
  background: rgb(255 255 255 / 95%);
  font-size: 10px;
  line-height: 1.3;
  color: #323233;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}
</style>
