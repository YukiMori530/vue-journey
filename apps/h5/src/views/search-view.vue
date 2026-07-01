<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import CoverImage from '../components/cover-image.vue'
import { filterDiscover } from '../data/discover'
import { useTripStore } from '../stores/trip'
import { showAppConfirmDialog } from '../utils/app-dialog'
import { ApiError } from '../api/client'
import type { FeaturedTopic, HotTrip } from '../data/discover'

const router = useRouter()
const tripStore = useTripStore()
const keyword = ref('')

const filtered = computed(() => filterDiscover(keyword.value))
const hotTrips = computed(() => filtered.value.trips)
const featuredTopics = computed(() => filtered.value.topics)
const isEmpty = computed(() => !hotTrips.value.length && !featuredTopics.value.length)

function goBack() {
  router.back()
}

async function openHotTrip(item: HotTrip) {
  try {
    await showAppConfirmDialog({
      title: '添加热门行程',
      message: `将「${item.title}」加入我的计划？`,
      confirmText: '添加',
      icon: 'confirm',
    })
    const trip = await tripStore.addTripFromHotTrip(item)
    showToast('已添加到我的计划')
    router.push(`/trip/${trip.id}`)
  } catch (error) {
    if (error instanceof ApiError) {
      showToast(error.message)
    }
  }
}

async function openTopic(item: FeaturedTopic) {
  try {
    await showAppConfirmDialog({
      title: '添加精选专题',
      message: `根据专题「${item.title}」生成探索行程？`,
      confirmText: '生成',
      icon: 'confirm',
    })
    const trip = await tripStore.addTripFromTopic(item)
    showToast('专题行程已生成')
    router.push(`/trip/${trip.id}`)
  } catch (error) {
    if (error instanceof ApiError) {
      showToast(error.message)
    }
  }
}

function showMore(type: 'trip' | 'topic') {
  showToast(type === 'trip' ? '更多热门行程即将上线' : '更多精选专题即将上线')
}
</script>

<template>
  <div class="search-page">
    <div class="page-bg" aria-hidden="true">
      <span class="blob blob-a" />
      <span class="blob blob-b" />
    </div>

    <div class="page-content">
      <header class="search-header">
        <button type="button" class="back-btn" aria-label="返回" @click="goBack">
          <van-icon name="arrow-left" size="20" />
        </button>
        <van-search
          v-model="keyword"
          class="search-input"
          shape="round"
          placeholder="搜索地点/行程/专题"
          autofocus
        />
      </header>

      <van-empty v-if="isEmpty" class="empty-state" description="没有找到相关内容" />

      <section v-if="hotTrips.length" class="discover-card">
        <div class="card-head">
          <h2 class="card-title">热门行程</h2>
          <button type="button" class="more-btn" @click="showMore('trip')">更多</button>
        </div>

        <button
          v-for="item in hotTrips"
          :key="item.id"
          type="button"
          class="hot-trip-item"
          @click="openHotTrip(item)"
        >
          <CoverImage
            :src="item.cover"
            :alt="item.title"
            img-class="hot-trip-cover"
          />
          <div class="hot-trip-info">
            <h3 class="hot-trip-title">{{ item.title }}</h3>
            <p class="hot-trip-meta">
              <span class="meta-chip">
                <van-icon name="clock-o" size="12" />
                {{ item.duration }}
              </span>
              <span class="meta-chip">
                <van-icon name="location-o" size="12" />
                {{ item.placeCount }} 个地点
              </span>
            </p>
          </div>
          <van-icon name="arrow" class="item-arrow" size="16" />
        </button>
      </section>

      <section v-if="featuredTopics.length" class="discover-card">
        <div class="card-head">
          <h2 class="card-title">精选专题</h2>
          <button type="button" class="more-btn" @click="showMore('topic')">更多</button>
        </div>

        <button
          v-for="item in featuredTopics"
          :key="item.id"
          type="button"
          class="topic-item"
          @click="openTopic(item)"
        >
          <CoverImage
            :src="item.cover"
            :alt="item.title"
            img-class="topic-cover"
          />
          <div class="topic-info">
            <h3 class="topic-title">{{ item.title }}</h3>
            <p class="topic-snippet">{{ item.snippet }}</p>
            <p class="topic-meta">
              <van-icon name="location-o" size="12" />
              {{ item.placeCount }} 个地点
            </p>
          </div>
          <van-icon name="arrow" class="item-arrow" size="16" />
        </button>
      </section>
    </div>
  </div>
</template>

<style scoped>
.search-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: linear-gradient(180deg, #e8f2ff 0%, #f5f7fa 24%, #f5f7fa 100%);
}

.page-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(50px);
  opacity: 0.4;
}

.blob-a {
  top: -60px;
  right: -50px;
  width: 200px;
  height: 200px;
  background: #9ec9ff;
}

.blob-b {
  top: 180px;
  left: -70px;
  width: 180px;
  height: 180px;
  background: #c8daf5;
}

.page-content {
  position: relative;
  z-index: 1;
  padding-bottom: 24px;
}

.search-header {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 16px 12px;
}

.back-btn {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgb(255 255 255 / 85%);
  box-shadow: 0 2px 8px rgb(25 137 250 / 8%);
  cursor: pointer;
}

.search-input {
  flex: 1;
  padding: 0;
  background: transparent;
}

.search-input :deep(.van-search__content) {
  background: rgb(255 255 255 / 92%);
  box-shadow: 0 2px 8px rgb(25 137 250 / 6%);
}

.empty-state {
  padding-top: 48px;
}

.discover-card {
  margin: 0 16px 14px;
  padding: 18px 16px;
  border: 1px solid rgb(255 255 255 / 80%);
  border-radius: 20px;
  background: rgb(255 255 255 / 92%);
  box-shadow: 0 8px 24px rgb(25 137 250 / 8%);
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: #111;
}

.more-btn {
  border: none;
  background: transparent;
  font-size: 13px;
  color: #969799;
  cursor: pointer;
}

.more-btn::after {
  content: ' ›';
}

.hot-trip-item,
.topic-item {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
  padding: 14px 0;
  border: none;
  border-top: 1px solid #f2f3f5;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.hot-trip-item:first-of-type,
.topic-item:first-of-type {
  border-top: none;
}

.hot-trip-item:active,
.topic-item:active {
  opacity: 0.85;
}

.hot-trip-item :deep(.hot-trip-cover),
.topic-item :deep(.topic-cover) {
  flex-shrink: 0;
  width: 76px;
  height: 76px;
  border-radius: 14px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgb(0 0 0 / 8%);
}

.hot-trip-info,
.topic-info {
  flex: 1;
  min-width: 0;
}

.hot-trip-title,
.topic-title {
  display: -webkit-box;
  margin: 0 0 8px;
  overflow: hidden;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.45;
  color: #323233;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.hot-trip-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
}

.meta-chip {
  display: inline-flex;
  gap: 3px;
  align-items: center;
  padding: 3px 8px;
  border-radius: 999px;
  background: #f2f6fc;
  font-size: 11px;
  color: #646566;
}

.topic-snippet {
  display: -webkit-box;
  margin: 0 0 8px;
  overflow: hidden;
  font-size: 13px;
  line-height: 1.5;
  color: #646566;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.topic-meta {
  display: inline-flex;
  gap: 3px;
  align-items: center;
  margin: 0;
  font-size: 12px;
  color: #969799;
}

.item-arrow {
  flex-shrink: 0;
  color: #c8c9cc;
}
</style>
