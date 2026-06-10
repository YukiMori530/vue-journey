<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function openSearch() {
  router.push('/search')
}

const categories = [
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

const mapMarkers = [
  { top: '18%', left: '22%', icon: '🌳', label: '颐和园' },
  { top: '28%', left: '55%', icon: '🎭', label: '国家体育场' },
  { top: '42%', left: '35%', icon: '🌳', label: '故宫博物院' },
  { top: '55%', left: '68%', icon: '🛍️', label: '国贸商城' },
  { top: '38%', left: '78%', icon: '🚄', label: '北京南站' },
]
</script>

<template>
  <div class="explore-page">
    <div class="map-area">
      <div class="map-bg" />

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
        >
          <span>{{ cat.icon }}</span>
          <span>{{ cat.label }}</span>
        </button>
      </div>

      <div
        v-for="marker in mapMarkers"
        :key="marker.label"
        class="map-marker"
        :style="{ top: marker.top, left: marker.left }"
      >
        <span class="marker-icon">{{ marker.icon }}</span>
        <span class="marker-label">{{ marker.label }}</span>
      </div>

      <div class="my-location">
        <van-icon name="aim" size="20" />
      </div>
    </div>

    <section class="bottom-sheet">
      <div class="sheet-handle" />
      <h2 class="sheet-title">为你发现了一些地点合集</h2>
      <div class="collection-scroll">
        <div
          v-for="item in collections"
          :key="item.id"
          class="collection-card"
        >
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

.map-bg {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgb(232 237 242 / 30%) 0%, rgb(232 237 242 / 0%) 30%),
    linear-gradient(#dce4ec 1px, transparent 1px),
    linear-gradient(90deg, #dce4ec 1px, transparent 1px),
    #e8edf2;
  background-size:
    100% 100%,
    40px 40px,
    40px 40px,
    100% 100%;
}

.explore-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 12px 16px 0;
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
  background: rgb(255 255 255 / 80%);
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
  background: #fff;
  font-size: 13px;
  color: #323233;
  box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
  white-space: nowrap;
  cursor: pointer;
}

.map-marker {
  position: absolute;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
  transform: translate(-50%, -50%);
}

.marker-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fff;
  font-size: 18px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 12%);
}

.marker-label {
  padding: 2px 6px;
  border-radius: 4px;
  background: rgb(255 255 255 / 90%);
  font-size: 10px;
  color: #323233;
  white-space: nowrap;
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
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 10px rgb(0 0 0 / 12%);
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
