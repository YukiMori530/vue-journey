<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useCollectStore } from '../stores/collect'
import { loadAMap } from '../utils/amap'

type MainTab = 'items' | 'groups'
type ViewMode = 'list' | 'map'

const router = useRouter()
const route = useRoute()
const collectStore = useCollectStore()

const mainTab = ref<MainTab>('items')
const viewMode = ref<ViewMode>('list')
const mapContainer = ref<HTMLElement | null>(null)
const mapInstance = shallowRef<AMap.Map | null>(null)
const mapMarkers = shallowRef<AMap.Marker[]>([])

const items = computed(() => collectStore.items)
const groups = computed(() => collectStore.groups)
const isEmpty = computed(() => items.value.length === 0)

function goBack() {
  router.back()
}

function openCamera() {
  router.push('/collect/camera')
}

function openItem(id: string) {
  showToast(`采集 #${id.slice(-4)} · 详情开发中`)
}

function createGroup() {
  showToast('新建分组开发中')
}

function clearMarkers() {
  mapMarkers.value.forEach((marker) => marker.setMap(null))
  mapMarkers.value = []
}

async function renderCollectMap() {
  if (!mapContainer.value || viewMode.value !== 'map' || mainTab.value !== 'items') {
    return
  }

  try {
    await loadAMap()

    if (!mapInstance.value) {
      mapInstance.value = new AMap.Map(mapContainer.value, {
        zoom: items.value.length ? 5 : 4,
        center: items.value[0] ? [items.value[0].lng, items.value[0].lat] : [104.1954, 35.8617],
        viewMode: '2D',
        mapStyle: 'amap://styles/normal',
      })
    }

    clearMarkers()

    mapMarkers.value = items.value.map((item) => {
      const marker = new AMap.Marker({
        position: [item.lng, item.lat],
        title: item.locationName,
        label: {
          content: `<div class="collect-map-label">${item.locationName}</div>`,
          direction: 'top',
        },
      })
      marker.setMap(mapInstance.value!)
      return marker
    })

    if (items.value.length > 1) {
      mapInstance.value.setFitView(mapMarkers.value, false, [40, 40, 40, 40])
    }
  } catch {
    showToast('地图加载失败')
  }
}

watch([viewMode, mainTab, items], () => {
  if (viewMode.value === 'map' && mainTab.value === 'items') {
    setTimeout(renderCollectMap, 100)
  }
})

onMounted(() => {
  if (route.query.view === 'map') {
    viewMode.value = 'map'
  }
  if (viewMode.value === 'map') {
    renderCollectMap()
  }
})

onUnmounted(() => {
  clearMarkers()
  mapInstance.value?.destroy()
  mapInstance.value = null
})
</script>

<template>
  <div class="collect-page">
    <header class="collect-header">
      <button type="button" class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="20" />
      </button>

      <div class="main-tabs">
        <button
          type="button"
          class="main-tab"
          :class="{ active: mainTab === 'items' }"
          @click="mainTab = 'items'"
        >
          采集
        </button>
        <button
          type="button"
          class="main-tab"
          :class="{ active: mainTab === 'groups' }"
          @click="mainTab = 'groups'"
        >
          分组
        </button>
      </div>

      <span class="header-spacer" />
    </header>

    <section v-if="mainTab === 'items'" class="collect-body">
      <template v-if="viewMode === 'list'">
        <div v-if="isEmpty" class="empty-state">
          <div class="empty-stamp" aria-hidden="true">
            <van-icon name="coupon-o" size="42" color="#dcdee0" />
          </div>
          <p class="empty-text">空空如也，立即开始你的采集吧</p>
          <button type="button" class="start-btn" @click="openCamera">开始采集</button>
        </div>

        <div v-else class="stamp-grid">
          <button
            v-for="item in items"
            :key="item.id"
            type="button"
            class="stamp-card"
            @click="openItem(item.id)"
          >
            <img :src="item.photo" :alt="item.locationName" />
            <p class="stamp-loc">{{ item.locationName }}</p>
          </button>
        </div>
      </template>

      <template v-else>
        <div class="map-panel">
          <div class="map-head">
            <div>
              <h2>全球</h2>
              <p>{{ collectStore.count }} 个采集</p>
            </div>
            <button type="button" class="filter-btn" @click="showToast('筛选开发中')">
              筛选
              <van-icon name="filter-o" size="14" />
            </button>
          </div>
          <div ref="mapContainer" class="collect-map" />
          <p v-if="isEmpty" class="map-empty-tip">还没有采集，点右下角相机开始</p>
        </div>
      </template>
    </section>

    <section v-else class="groups-body">
      <div class="group-grid">
        <button
          v-for="group in groups"
          :key="group.id"
          type="button"
          class="group-card"
          @click="showToast(`${group.name}：${collectStore.groupCount(group.id)} 个采集`)"
        >
          <span class="group-name">{{ group.name }}</span>
          <span class="group-count">{{ collectStore.groupCount(group.id) }}</span>
        </button>
      </div>
      <button type="button" class="group-add" aria-label="新建分组" @click="createGroup">
        <van-icon name="plus" size="22" />
      </button>
    </section>

    <footer v-if="mainTab === 'items'" class="collect-footer">
      <div class="view-toggle">
        <button
          type="button"
          class="toggle-btn"
          :class="{ active: viewMode === 'list' }"
          @click="viewMode = 'list'"
        >
          <van-icon name="bars" size="16" />
          列表
        </button>
        <button
          type="button"
          class="toggle-btn"
          :class="{ active: viewMode === 'map' }"
          @click="viewMode = 'map'"
        >
          <van-icon name="location-o" size="16" />
          地图
        </button>
      </div>

      <button type="button" class="camera-fab" aria-label="采集" @click="openCamera">
        <van-icon name="photograph" size="22" />
      </button>
    </footer>
  </div>
</template>

<style scoped>
.collect-page {
  min-height: 100vh;
  padding-bottom: calc(88px + env(safe-area-inset-bottom));
  background: #f5f6f7;
}

.collect-header {
  display: grid;
  grid-template-columns: 40px 1fr 40px;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
}

.main-tabs {
  display: flex;
  gap: 24px;
  justify-content: center;
}

.main-tab {
  position: relative;
  padding: 6px 0;
  border: none;
  background: transparent;
  font-size: 16px;
  font-weight: 500;
  color: #969799;
  cursor: pointer;
}

.main-tab.active {
  font-weight: 700;
  color: #111;
}

.main-tab.active::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 3px;
  border-radius: 999px;
  background: #111;
}

.header-spacer {
  width: 36px;
}

.collect-body,
.groups-body {
  padding: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 24px 24px;
  text-align: center;
}

.empty-stamp {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  margin-bottom: 20px;
  border: 2px dashed #dcdee0;
  border-radius: 18px;
  transform: rotate(-8deg);
}

.empty-text {
  margin: 0 0 24px;
  font-size: 14px;
  color: #646566;
}

.start-btn {
  min-width: 180px;
  padding: 14px 28px;
  border: none;
  border-radius: 999px;
  background: #111;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
}

.stamp-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stamp-card {
  padding: 0;
  border: none;
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 4px 14px rgb(0 0 0 / 6%);
  cursor: pointer;
}

.stamp-card img {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.stamp-loc {
  margin: 0;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #323233;
  text-align: left;
}

.map-panel {
  overflow: hidden;
  border-radius: 18px;
  background: #fff;
}

.map-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 16px 8px;
}

.map-head h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #111;
}

.map-head p {
  margin: 4px 0 0;
  font-size: 13px;
  color: #969799;
}

.filter-btn {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 8px 12px;
  border: none;
  border-radius: 999px;
  background: #f2f3f5;
  font-size: 13px;
  color: #323233;
  cursor: pointer;
}

.collect-map {
  height: 420px;
}

.map-empty-tip {
  margin: 0;
  padding: 12px 16px 16px;
  font-size: 13px;
  color: #969799;
  text-align: center;
}

.groups-body {
  position: relative;
  min-height: 60vh;
}

.group-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.group-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 120px;
  padding: 16px;
  border: none;
  border-radius: 16px;
  background: #fff;
  text-align: left;
  box-shadow: 0 4px 14px rgb(0 0 0 / 6%);
  cursor: pointer;
}

.group-name {
  font-size: 15px;
  font-weight: 600;
  color: #323233;
}

.group-count {
  font-size: 28px;
  font-weight: 800;
  color: #111;
}

.group-add {
  position: fixed;
  right: 20px;
  bottom: calc(24px + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border: none;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 4px 16px rgb(0 0 0 / 12%);
  cursor: pointer;
}

.collect-footer {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 480px;
  margin: 0 auto;
  padding: 12px 20px calc(12px + env(safe-area-inset-bottom));
  pointer-events: none;
}

.view-toggle,
.camera-fab {
  pointer-events: auto;
}

.view-toggle {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 4px 16px rgb(0 0 0 / 10%);
}

.toggle-btn {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 8px 14px;
  border: none;
  border-radius: 999px;
  background: transparent;
  font-size: 13px;
  color: #646566;
  cursor: pointer;
}

.toggle-btn.active {
  background: #eef0ff;
  color: #111;
  font-weight: 600;
}

.camera-fab {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border: 2px solid #111;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
}
</style>

<style>
.collect-map-label {
  padding: 4px 8px;
  border-radius: 10px;
  background: #fff;
  font-size: 11px;
  color: #323233;
  box-shadow: 0 2px 8px rgb(0 0 0 / 12%);
}
</style>
