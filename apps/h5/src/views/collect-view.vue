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
const activeGroupId = ref<string | null>(null)

const visibleItems = computed(() => {
  if (!activeGroupId.value) {
    return items.value
  }
  return items.value.filter((item) => item.groupId === activeGroupId.value)
})

function groupPreviews(groupId: string) {
  return collectStore.itemsByGroup(groupId).slice(0, 4).map((item) => item.photo)
}

function openGroup(groupId: string) {
  activeGroupId.value = groupId
  mainTab.value = 'items'
  viewMode.value = 'list'
}

function clearGroupFilter() {
  activeGroupId.value = null
}

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
      <div v-if="activeGroupId" class="filter-bar">
        <span>{{ groups.find((g) => g.id === activeGroupId)?.name }}</span>
        <button type="button" @click="clearGroupFilter">清除</button>
      </div>

      <template v-if="viewMode === 'list'">
        <div v-if="isEmpty" class="empty-state">
          <div class="empty-stamp" aria-hidden="true">
            <van-icon name="coupon-o" size="42" color="#dcdee0" />
          </div>
          <p class="empty-text">空空如也，立即开始你的采集吧</p>
          <button type="button" class="start-btn" @click="openCamera">开始采集</button>
        </div>

        <div v-else-if="visibleItems.length === 0" class="empty-state empty-state--small">
          <p class="empty-text">这个分组还没有采集</p>
          <button type="button" class="start-btn start-btn--ghost" @click="clearGroupFilter">
            查看全部
          </button>
        </div>

        <div v-else class="stamp-grid">
          <button
            v-for="item in visibleItems"
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
      <p class="groups-tip">把采集整理进文件夹，方便回顾</p>
      <div class="group-grid">
        <button
          v-for="group in groups"
          :key="group.id"
          type="button"
          class="group-folder"
          @click="openGroup(group.id)"
        >
          <div class="group-folder__cover">
            <template v-if="groupPreviews(group.id).length">
              <img
                v-for="(photo, index) in groupPreviews(group.id)"
                :key="index"
                :src="photo"
                :alt="group.name"
                class="group-folder__thumb"
              />
            </template>
            <div v-else class="group-folder__empty">
              <van-icon name="folder-o" size="28" color="#c8c9cc" />
            </div>
          </div>
          <div class="group-folder__meta">
            <span class="group-folder__name">{{ group.name }}</span>
            <span class="group-folder__count">{{ collectStore.groupCount(group.id) }}</span>
          </div>
        </button>

        <button type="button" class="group-folder group-folder--add" @click="createGroup">
          <div class="group-folder__cover group-folder__cover--add">
            <van-icon name="plus" size="28" color="#969799" />
          </div>
          <span class="group-folder__name">新建分组</span>
        </button>
      </div>
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
  background: linear-gradient(180deg, #fafbfc 0%, #f2f3f5 100%);
}

.collect-header {
  display: grid;
  grid-template-columns: 40px 1fr 40px;
  align-items: center;
  padding: 12px 16px;
  background: rgb(255 255 255 / 92%);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgb(0 0 0 / 4%);
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
  display: inline-flex;
  gap: 4px;
  justify-self: center;
  padding: 4px;
  border-radius: 12px;
  background: #f2f3f5;
}

.main-tab {
  position: relative;
  padding: 8px 20px;
  border: none;
  border-radius: 9px;
  background: transparent;
  font-size: 15px;
  font-weight: 600;
  color: #969799;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.main-tab.active {
  background: #fff;
  color: #111;
  box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
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

.start-btn--ghost {
  background: #fff;
  color: #111;
  box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
}

.empty-state--small {
  padding-top: 48px;
}

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  background: #fff;
  font-size: 13px;
  color: #646566;
  box-shadow: 0 2px 8px rgb(0 0 0 / 4%);
}

.filter-bar button {
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: #111;
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
  border-radius: 18px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 6px 20px rgb(0 0 0 / 7%);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.stamp-card:active {
  transform: scale(0.98);
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
  min-height: 60vh;
  padding-top: 8px;
}

.groups-tip {
  margin: 0 0 16px;
  font-size: 13px;
  color: #969799;
}

.group-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.group-folder {
  padding: 0;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.group-folder__cover {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3px;
  aspect-ratio: 1;
  padding: 3px;
  overflow: hidden;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 8px 24px rgb(0 0 0 / 8%);
}

.group-folder__cover--add {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1.5px dashed #dcdee0;
  box-shadow: none;
}

.group-folder__thumb {
  width: 100%;
  height: 100%;
  min-height: 64px;
  object-fit: cover;
  border-radius: 10px;
}

.group-folder__empty {
  display: flex;
  grid-column: 1 / -1;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 140px;
  border-radius: 16px;
  background: linear-gradient(145deg, #f7f8fa 0%, #eef0f3 100%);
}

.group-folder__meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: 10px;
  padding: 0 4px;
}

.group-folder__name {
  font-size: 15px;
  font-weight: 700;
  color: #111;
}

.group-folder--add .group-folder__name {
  display: block;
  margin-top: 10px;
  padding: 0 4px;
  font-weight: 600;
  color: #646566;
}

.group-folder__count {
  font-size: 22px;
  font-weight: 800;
  color: #111;
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
