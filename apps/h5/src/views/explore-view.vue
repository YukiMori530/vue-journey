<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import PlaceCoverImage from '../components/place-cover-image.vue'
import { exploreCities, getCityByIdOrDefault, type ExplorePoi, type PoiCategory } from '../data/explore-pois'
import { mapStories, type MapStory } from '../data/explore-discover'
import { fetchExploreFeed, type ExploreCollectionItem, type ExploreHotCity } from '../api/notes'
import { useAuthStore } from '../stores/auth'
import { loadAMap } from '../utils/amap'
import { detectUserLocation } from '../utils/user-location'

const TAB_BAR_HEIGHT = 68

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const exploreCollections = ref<ExploreCollectionItem[]>([])
const hotCities = ref<ExploreHotCity[]>([])
const feedLoading = ref(true)

const mapContainer = ref<HTMLElement | null>(null)
const mapInstance = shallowRef<AMap.Map | null>(null)
const poiMarkers = shallowRef<AMap.Marker[]>([])
const storyMarkers = shallowRef<AMap.Marker[]>([])
const mapLoading = ref(true)
const mapError = ref('')
const selectedCategory = ref<PoiCategory | null>(null)
const currentCityId = ref(exploreCities[0].id)
const showCityPicker = ref(false)

const sheetHeight = ref(280)
const sheetAnchors = ref<number[]>([280, 560])
const safeAreaBottom = ref(0)
const isSheetExpanded = computed(() => {
  const fullAnchor = sheetAnchors.value.at(-1) ?? 560
  return sheetHeight.value >= fullAnchor - 24
})

const currentCity = computed(() => getCityByIdOrDefault(currentCityId.value))

const cityActions = exploreCities.map((city) => ({
  name: city.name,
  id: city.id,
}))

const categories: Array<{ icon: string; label: PoiCategory }> = [
  { icon: '🌳', label: '景点' },
  { icon: '🍴', label: '美食' },
  { icon: '🥤', label: '饮品' },
  { icon: '🛍️', label: '购物' },
  { icon: '🛏️', label: '住宿' },
]

const visiblePois = computed(() => {
  const pois = currentCity.value.pois
  if (!selectedCategory.value) {
    return pois
  }
  return pois.filter((poi) => poi.category === selectedCategory.value)
})

const visibleStories = computed(() =>
  mapStories.filter((story) => story.cityId === currentCityId.value),
)

function buildStoryContent(story: MapStory) {
  return `
    <div class="map-story-marker">
      <img class="map-story-marker__img" src="${story.cover}" alt="" />
      <div class="map-story-marker__bubble">${story.text}</div>
      <div class="map-story-marker__loc">${story.location}</div>
    </div>
  `
}

function switchCity(cityId: string) {
  if (cityId === currentCityId.value) {
    return
  }

  currentCityId.value = cityId
  selectedCategory.value = null

  const map = mapInstance.value
  if (map) {
    map.setCenter(currentCity.value.center)
    renderMapMarkers()
  }
}

function onCitySelect(action: { name: string }) {
  const city = exploreCities.find((item) => item.name === action.name)
  if (city) {
    switchCity(city.id)
    showToast(`已切换到${city.name}`)
  }
}

function openCityPicker() {
  showCityPicker.value = true
}

function openSearch() {
  router.push('/search')
}

function openProfile() {
  if (!authStore.isLoggedIn) {
    router.push('/login')
    return
  }
  router.push('/profile')
}

function toggleCategory(label: PoiCategory) {
  selectedCategory.value = selectedCategory.value === label ? null : label
  renderPoiMarkers()
}

function handlePoiClick(poi: ExplorePoi) {
  showToast({
    message: `${poi.name} · 加入行程功能开发中`,
    duration: 2000,
  })
}

function handleStoryClick(story: MapStory) {
  const city = exploreCities.find((item) => item.id === story.cityId)
  if (city) {
    router.push(`/explore/city/${city.id}`)
    return
  }
  showToast(story.text)
}

function clearPoiMarkers() {
  poiMarkers.value.forEach((marker) => marker.setMap(null))
  poiMarkers.value = []
}

function clearStoryMarkers() {
  storyMarkers.value.forEach((marker) => marker.setMap(null))
  storyMarkers.value = []
}

function renderPoiMarkers() {
  const map = mapInstance.value
  if (!map) {
    return
  }

  clearPoiMarkers()

  poiMarkers.value = visiblePois.value.map((poi) => {
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
}

function renderStoryMarkers() {
  const map = mapInstance.value
  if (!map) {
    return
  }

  clearStoryMarkers()

  storyMarkers.value = visibleStories.value.map((story) => {
    const marker = new AMap.Marker({
      position: [story.lng, story.lat],
      content: buildStoryContent(story),
      offset: new AMap.Pixel(-58, -92),
      zIndex: 120,
    })

    marker.on('click', () => handleStoryClick(story))
    marker.setMap(map)
    return marker
  })
}

function renderMapMarkers() {
  renderStoryMarkers()
  renderPoiMarkers()
}

async function initMap() {
  if (!mapContainer.value) {
    return
  }

  try {
    await loadAMap()

    const map = new AMap.Map(mapContainer.value, {
      zoom: 11,
      center: currentCity.value.center,
      viewMode: '2D',
      mapStyle: 'amap://styles/normal',
    })

    map.add(new AMap.Scale({ position: 'LB' }))
    mapInstance.value = map
    renderMapMarkers()
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
      map.setCenter(currentCity.value.center)
      showToast(`定位失败，已回到${currentCity.value.name}`)
    },
    () => {
      map.setCenter(currentCity.value.center)
      showToast(`定位失败，已回到${currentCity.value.name}`)
    },
  )
}

function resolveExploreCityId(destination: string) {
  const normalized = destination.replace(/(市|县|区|省)$/, '')
  const matched = exploreCities.find(
    (city) =>
      city.name.includes(normalized) ||
      normalized.includes(city.name.replace(/(市|县|区)$/, '')),
  )
  return matched?.id ?? normalized.toLowerCase()
}

function openCollection(item: ExploreCollectionItem) {
  router.push(`/explore/city/${resolveExploreCityId(item.destination)}`)
}

function openHotCity(city: ExploreHotCity) {
  const dest = city.name.replace(/(市|县|区|省)$/, '')
  router.push({ path: `/explore/city/${city.id}`, query: { dest } })
}

function getSafeAreaBottom() {
  if (typeof window === 'undefined') {
    return 0
  }
  const probe = document.createElement('div')
  probe.style.cssText = 'padding-bottom: env(safe-area-inset-bottom); position: fixed; visibility: hidden;'
  document.body.appendChild(probe)
  const value = parseFloat(getComputedStyle(probe).paddingBottom) || 0
  document.body.removeChild(probe)
  return value
}

function updateSheetAnchors() {
  safeAreaBottom.value = getSafeAreaBottom()
  const tabBarOffset = TAB_BAR_HEIGHT + safeAreaBottom.value
  const viewportHeight = window.innerHeight
  const collapsed = Math.round(Math.min(300, viewportHeight * 0.38))
  const full = Math.round(viewportHeight - tabBarOffset)
  const wasExpanded = isSheetExpanded.value

  sheetAnchors.value = [collapsed, full]
  sheetHeight.value = wasExpanded ? full : collapsed
}

function toggleSheetExpand() {
  const [collapsed, full] = sheetAnchors.value
  sheetHeight.value = isSheetExpanded.value ? collapsed : full
}

async function loadExploreFeed() {
  feedLoading.value = true
  try {
    const feed = await fetchExploreFeed()
    exploreCollections.value = feed.collections
    hotCities.value = feed.hotCities
  } catch {
    showToast('地点合集加载失败，请稍后重试')
  } finally {
    feedLoading.value = false
  }
}

async function initUserCity() {
  const queryCity = typeof route.query.city === 'string' ? route.query.city : ''
  if (queryCity) {
    switchCity(queryCity)
    return
  }

  const location = await detectUserLocation()
  if (!location) {
    return
  }

  if (location.cityId) {
    switchCity(location.cityId)
  }

  const map = mapInstance.value
  if (map) {
    map.setCenter([location.lng, location.lat])
  }
}

onMounted(async () => {
  updateSheetAnchors()
  window.addEventListener('resize', updateSheetAnchors)
  await Promise.all([initMap(), loadExploreFeed()])
  await initUserCity()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateSheetAnchors)
  clearPoiMarkers()
  clearStoryMarkers()
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
        <button type="button" class="city-info" @click="openCityPicker">
          <div class="city-row">
            <span class="city-name">{{ currentCity.name }}</span>
            <van-icon name="arrow-down" size="12" />
          </div>
          <p class="weather">{{ currentCity.weather }}</p>
        </button>
        <div class="header-actions">
          <button type="button" class="icon-btn" aria-label="搜索" @click="openSearch">
            <van-icon name="search" size="24" />
          </button>
          <button type="button" class="avatar-btn" aria-label="个人" @click="openProfile">
            <span v-if="authStore.isLoggedIn" class="avatar-text">
              {{ authStore.displayName.slice(0, 1) }}
            </span>
            <van-icon v-else name="user-o" size="20" />
          </button>
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

    <van-floating-panel
      v-model:height="sheetHeight"
      :anchors="sheetAnchors"
      :duration="0.38"
      class="explore-sheet"
      :class="{ 'is-expanded': isSheetExpanded }"
      safe-area-inset-bottom
    >
      <button type="button" class="sheet-handle-wrap" aria-label="展开或收起" @click="toggleSheetExpand">
        <div class="sheet-handle" />
      </button>
      <div class="sheet-content">
        <h2 class="sheet-title">为你发现了一些地点合集</h2>
        <van-loading v-if="feedLoading" class="feed-loading" vertical size="20">加载中...</van-loading>
        <div v-else class="collection-scroll">
          <button
            v-for="item in exploreCollections"
            :key="item.id"
            type="button"
            class="collection-card"
            @click="openCollection(item)"
          >
            <PlaceCoverImage
              class="collection-cover"
              :name="item.coverPlace"
              :destination="item.destination"
            />
            <p class="collection-title">{{ item.title }}</p>
          </button>
        </div>

        <div v-if="!feedLoading" class="hot-city-list">
          <button
            v-for="city in hotCities"
            :key="city.id"
            type="button"
            class="hot-city-item"
            @click="openHotCity(city)"
          >
            <PlaceCoverImage
              class="hot-city-cover"
              :name="city.coverPlace"
              :destination="city.name"
            />
            <div class="hot-city-info">
              <div class="hot-city-head">
                <h3>{{ city.name }}</h3>
                <div class="hot-city-tags">
                  <span v-if="city.rankTag" class="tag tag--rank">{{ city.rankTag }}</span>
                  <span class="tag">{{ city.planCount }}</span>
                </div>
              </div>
              <p class="hot-city-desc">{{ city.description }}</p>
            </div>
          </button>
        </div>
      </div>
    </van-floating-panel>

    <van-action-sheet
      v-model:show="showCityPicker"
      :actions="cityActions"
      cancel-text="取消"
      description="选择探索城市"
      close-on-click-action
      @select="onCitySelect"
    />
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
  z-index: 1;
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

.city-info {
  padding: 0;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
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

.icon-btn,
.avatar-btn {
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
  box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
}

.avatar-btn {
  background: #1989fa;
  color: #fff;
}

.avatar-text {
  font-size: 15px;
  font-weight: 700;
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
  background: #111;
  color: #fff;
}

.my-location {
  position: absolute;
  right: 16px;
  bottom: calc(364px + env(safe-area-inset-bottom));
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

.explore-sheet {
  --van-floating-panel-border-radius: 20px;
  --van-floating-panel-background: #fff;
  --van-floating-panel-header-height: 0;

  right: 0;
  bottom: calc(68px + env(safe-area-inset-bottom)) !important;
  left: 0;
  z-index: 20;
  max-width: 480px;
  margin: 0 auto;
  box-shadow: 0 -8px 32px rgb(0 0 0 / 10%);
}

.explore-sheet.is-expanded {
  --van-floating-panel-border-radius: 0;

  box-shadow: none;
}

.explore-sheet :deep(.van-floating-panel__content) {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.sheet-handle-wrap {
  display: block;
  flex-shrink: 0;
  width: 100%;
  padding: 10px 0 4px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.sheet-handle {
  width: 36px;
  height: 4px;
  margin: 0 auto;
  border-radius: 2px;
  background: #dcdee0;
  transition: width 0.25s ease, background 0.25s ease;
}

.explore-sheet:active .sheet-handle,
.sheet-handle-wrap:hover .sheet-handle {
  width: 44px;
  background: #c8c9cc;
}

.sheet-content {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.sheet-content::-webkit-scrollbar {
  display: none;
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
  padding: 0 16px 14px;
  overflow-x: auto;
  scrollbar-width: none;
}

.collection-scroll::-webkit-scrollbar {
  display: none;
}

.collection-card {
  flex-shrink: 0;
  width: 148px;
  padding: 0;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.collection-card :deep(.collection-cover) {
  width: 148px;
  height: 112px;
  border-radius: 14px;
  overflow: hidden;
}

.collection-title {
  display: -webkit-box;
  margin: 8px 0 0;
  overflow: hidden;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  color: #323233;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.hot-city-list {
  padding: 0 16px;
  border-top: 8px solid #f5f6f7;
}

.hot-city-item {
  display: flex;
  gap: 12px;
  width: 100%;
  padding: 14px 0;
  border: none;
  border-top: 1px solid #f2f3f5;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.hot-city-item:first-child {
  border-top: none;
}

.hot-city-item :deep(.hot-city-cover) {
  flex-shrink: 0;
  width: 72px;
  height: 72px;
  border-radius: 12px;
  overflow: hidden;
}

.hot-city-info {
  flex: 1;
  min-width: 0;
}

.hot-city-head h3 {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 700;
  color: #111;
}

.hot-city-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 6px;
}

.tag {
  padding: 2px 8px;
  border-radius: 999px;
  background: #f2f3f5;
  font-size: 11px;
  color: #646566;
}

.tag--rank {
  background: #fff7e6;
  color: #ed6a0c;
}

.hot-city-desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #646566;
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

.map-story-marker {
  width: 116px;
  text-align: center;
}

.map-story-marker__img {
  width: 52px;
  height: 52px;
  border: 2px solid #fff;
  border-radius: 10px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
}

.map-story-marker__bubble {
  position: relative;
  margin-top: 6px;
  padding: 6px 8px;
  border-radius: 12px;
  background: #fff;
  font-size: 11px;
  line-height: 1.35;
  color: #323233;
  box-shadow: 0 2px 10px rgb(0 0 0 / 12%);
}

.map-story-marker__loc {
  margin-top: 4px;
  font-size: 10px;
  color: #969799;
}
</style>
