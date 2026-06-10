<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { filterDiscover } from '../data/discover'
import type { FeaturedTopic, HotTrip } from '../data/discover'

const router = useRouter()
const keyword = ref('')

const filtered = computed(() => filterDiscover(keyword.value))
const hotTrips = computed(() => filtered.value.trips)
const featuredTopics = computed(() => filtered.value.topics)
const isEmpty = computed(() => !hotTrips.value.length && !featuredTopics.value.length)

function goBack() {
  router.back()
}

function openHotTrip(item: HotTrip) {
  showToast(`「${item.title}」模板即将上线`)
}

function openTopic(item: FeaturedTopic) {
  showToast(`「${item.title}」专题即将上线`)
}

function showMore(type: 'trip' | 'topic') {
  showToast(type === 'trip' ? '更多热门行程即将上线' : '更多精选专题即将上线')
}
</script>

<template>
  <div class="search-page">
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

    <van-empty v-if="isEmpty" description="没有找到相关内容" />

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
        <img class="hot-trip-cover" :src="item.cover" :alt="item.title" />
        <div class="hot-trip-info">
          <h3 class="hot-trip-title">{{ item.title }}</h3>
          <p class="hot-trip-meta">
            <van-icon name="clock-o" size="12" />
            <span>{{ item.duration }}</span>
            <van-icon name="location-o" size="12" />
            <span>{{ item.placeCount }} 个地点</span>
          </p>
        </div>
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
        <img class="topic-cover" :src="item.cover" :alt="item.title" />
        <div class="topic-info">
          <h3 class="topic-title">{{ item.title }}</h3>
          <p class="topic-snippet">{{ item.snippet }}</p>
          <p class="topic-meta">{{ item.placeCount }} 个地点</p>
        </div>
      </button>
    </section>
  </div>
</template>

<style scoped>
.search-page {
  min-height: 100vh;
  padding-bottom: 24px;
  background: #f5f6f7;
}

.search-header {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 12px 12px;
  background: #f5f6f7;
}

.back-btn {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
}

.search-input {
  flex: 1;
  padding: 0;
  background: transparent;
}

.search-input :deep(.van-search__content) {
  background: #fff;
}

.discover-card {
  margin: 0 16px 12px;
  padding: 16px;
  border-radius: 16px;
  background: #fff;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
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
  width: 100%;
  padding: 12px 0;
  border: none;
  border-top: 1px solid #f2f3f5;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.hot-trip-item:first-of-type,
.topic-item:first-of-type {
  border-top: none;
  padding-top: 0;
}

.hot-trip-cover,
.topic-cover {
  flex-shrink: 0;
  width: 72px;
  height: 72px;
  border-radius: 12px;
  object-fit: cover;
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
  line-height: 1.4;
  color: #323233;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.hot-trip-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  align-items: center;
  margin: 0;
  font-size: 12px;
  color: #969799;
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
  margin: 0;
  font-size: 12px;
  color: #969799;
}
</style>
