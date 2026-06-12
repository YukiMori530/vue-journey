<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { DEFAULT_CENTER, explorePois, type ExplorePoi, type PoiCategory } from '../data/explore-pois'
import { loadAMap } from '../utils/amap'

const router = useRouter()

const mapContainer = ref<HTMLElement | null>(null)
const mapInstance = shallowRef<AMap.Map | null>(null)
const markerInstances = shallowRef<AMap.Marker[]>([])
const mapLoading = ref(true)
const mapError = ref('')
const selectedCategory = ref<PoiCategory | null>(null)

const categories: Array<{ icon: string; label: PoiCategory }> = [
  { icon: '🌳', label: '景点' },
  { icon: '🍴', label: '美食' },
  { icon: '🥤', label: '饮品' },
  { icon: '🛍️', label: '购物' },
  { icon: '🛏️', label: '住宿' },
]

const collections = [
  {
    id: 1,
    cover: 'https://images.unsplash.com/photo-1508804185872-d83badad00f2?w=400&q=80',
  },
  {
    id: 2,
    cover: 'https://images.unsplash.com/photo-1547981609-4c6a41de1593?w=400&q=80',
  },
  {
    id: 3,
    cover: 'https://images.unsplash.com/photo-1596422846543-75c6fc4f9f50?w=400&q=80',
  },
]

const visiblePois = computed(() => {
  if (!selectedCategory.value) {
    return explorePois
  }
  return explorePois.filter((poi) => poi.category === selectedCategory.value)
})

function openSearch() {
  router.push('/search')
}

function toggleCategory(label: PoiCategory) {
  selectedCategory.value = selectedCategory.value === label ? null : label
  renderMarkers()
}

function handlePoiClick(poi: ExplorePoi) {
  showToast({
    message: `${poi.name} · 加入行程功能开发中`,
    duration: 2000,
  })
}

function clearMarkers() {
  markerInstances.value.forEach((marker) => marker.setMap(null))
  markerInstances.value = []
}

function renderMarkers() {
  const map = mapInstance.value
  if (!map) {
    return
  }

  clearMarkers()

  const markers = visiblePois.value.map((poi) => {
    const marker = new AMap.Marker({
      position: [poi.lng, poi.lat],
      title: poi.name,
      label: {
        content: `<div class="amap-marker-label">${poi.icon} ${poi.name}</div>`,
        direction: 'top',
      },
    })

    marker.on('click', () => handlePoiClick(poi))
    marker.setMap(map)
    return marker
  })

  markerInstances.value = markers
}

async function initMap() {
  if (!mapContainer.value) {
    return
  }

  try {
    await loadAMap()

    const map = new AMap.Map(mapContainer.value, {
      zoom: 12,
      center: DEFAULT_CENTER,
      viewMode: '2D',
      mapStyle: 'amap://styles/normal',
    })

    map.add(new AMap.Scale({ position: 'LB' }))
    mapInstance.value = map
    renderMarkers()
  } catch (error) {
    mapError.value =
      error instanceof Error ? error.message : '地图加载失败，请检查 Key 配置'
  } finally {
    mapLoading.value = false
  }
}

function handleMyLocation() {
  const map = mapInstance.value
  if (!map) {
    return
  }

  const geolocation = new AMap.Geolocation({
    enableHighAccuracy: true,
    timeout: 8000,
  })

  geolocation.getCurrentPosition(
    (status, result) => {
      if (status === 'complete') {
        map.setCenter([result.position.lng, result.position.lat])
        showToast('已定位到当前位置')
        return
      }
      map.setCenter(DEFAULT_CENTER)
      showToast('定位失败，已回到北京市中心')
    },
    () => {
      map.setCenter(DEFAULT_CENTER)
      showToast('定位失败，已回到北京市中心')
    },
  )
}

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  clearMarkers()
  mapInstance.value?.destroy()
  mapInstance.value = null
})
</script>

<template>
  <div class="explore-page">
    <div class="map-area">
      <div ref="mapContainer" class="amap-container" />

      <van-loading v-if="mapLoading" class="map-loading" vertical>
        地图加载中...
      </van-loading>

      <div v-else-if="mapError" class="map-error">
        <p>{{ mapError }}</p>
      </div>

      <header class="explore-header">
        <div class="city-info">
          <div class="city-row">
            <span class="city-name">北京市</span>
            <van-icon name="arrow-down" size="12" />
          </div>
          <p class="weather">⛈ 雷暴 16° - 27°</p>
        </div>
        <div class="header-actions">
          <button type="button" class="icon-btn" aria-label="搜索" @click="openSearch">
            <van-icon name="search" size="24" />
          </button>
          <img
            class="user-avatar"
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80"
            alt="头像"
          />
        </div>
      </header>

      <div class="category-scroll">
        <button
          v-for="cat in categories"
          :key="cat.label"
          type="button"
          class="category-pill"
          :class="{ active: selectedCategory === cat.label }"
          @click="toggleCategory(cat.label)"
        >
          <span>{{ cat.icon }}</span>
          <span>{{ cat.label }}</span>
        </button>
      </div>

      <button type="button" class="my-location" aria-label="定位" @click="handleMyLocation">
        <van-icon name="aim" size="20" />
      </button>
    </div>

    <section class="bottom-sheet">
      <div class="sheet-handle" />
      <h2 class="sheet-title">为你发现了一些地点合集</h2>
      <div class="collection-scroll">
        <div v-for="item in collections" :key="item.id" class="collection-card">
          <img :src="item.cover" alt="地点合集" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.explore-page {
  position: relative;
  height: 100vh;
  overflow: hidden;
  background: #e8edf2;
}

.map-area {
  position: absolute;
  inset: 0;
  bottom: 200px;
}

.amap-container {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.map-loading,
.map-error {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(232 237 242 / 88%);
}

.map-error p {
  max-width: 260px;
  margin: 0;
  padding: 0 16px;
  font-size: 14px;
  line-height: 1.6;
  color: #646566;
  text-align: center;
}

.explore-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 12px 16px 0;
  pointer-events: none;
}

.explore-header > * {
  pointer-events: auto;
}

.city-name {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
}

.city-row {
  display: flex;
  gap: 2px;
  align-items: center;
}

.weather {
  margin: 4px 0 0;
  font-size: 12px;
  color: #646566;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgb(255 255 255 / 90%);
  color: #111;
  cursor: pointer;
}

.user-avatar {
  width: 38px;
  height: 38px;
  border: 2px solid #fff;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}

.category-scroll {
  position: relative;
  z-index: 2;
  display: flex;
  gap: 10px;
  padding: 14px 16px;
  overflow-x: auto;
  scrollbar-width: none;
  pointer-events: auto;
}

.category-scroll::-webkit-scrollbar {
  display: none;
}

.category-pill {
  display: flex;
  flex-shrink: 0;
  gap: 4px;
  align-items: center;
  padding: 8px 14px;
  border: none;
  border-radius: 20px;
  background: rgb(255 255 255 / 92%);
  font-size: 13px;
  color: #323233;
  box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
  white-space: nowrap;
  cursor: pointer;
}

.category-pill.active {
  background: #1989fa;
  color: #fff;
}

.my-location {
  position: absolute;
  right: 16px;
  bottom: 24px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 10px rgb(0 0 0 / 12%);
  cursor: pointer;
}

.bottom-sheet {
  position: fixed;
  right: 0;
  bottom: 72px;
  left: 0;
  z-index: 10;
  max-width: 480px;
  margin: 0 auto;
  padding: 8px 0 16px;
  border-radius: 20px 20px 0 0;
  background: #fff;
  box-shadow: 0 -4px 20px rgb(0 0 0 / 8%);
}

.sheet-handle {
  width: 36px;
  height: 4px;
  margin: 0 auto 12px;
  border-radius: 2px;
  background: #dcdee0;
}

.sheet-title {
  margin: 0 0 14px;
  padding: 0 16px;
  font-size: 17px;
  font-weight: 700;
  color: #1a1a1a;
}

.collection-scroll {
  display: flex;
  gap: 12px;
  padding: 0 16px;
  overflow-x: auto;
  scrollbar-width: none;
}

.collection-scroll::-webkit-scrollbar {
  display: none;
}

.collection-card {
  flex-shrink: 0;
  width: 140px;
  height: 180px;
  overflow: hidden;
  border-radius: 14px;
}

.collection-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>

<style>
.amap-marker-label {
  padding: 4px 8px;
  border-radius: 12px;
  background: rgb(255 255 255 / 95%);
  font-size: 11px;
  color: #323233;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgb(0 0 0 / 12%);
}
</style>
