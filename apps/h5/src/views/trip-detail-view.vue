<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import { useTripStore } from '../stores/trip'
import { useAuthStore } from '../stores/auth'
import { useProfileStore } from '../stores/profile'
import { ApiError } from '../api/client'
import { resolveTripCardBg } from '../utils/trip-themes'

const route = useRoute()
const router = useRouter()
const tripStore = useTripStore()
const authStore = useAuthStore()
const profileStore = useProfileStore()
const detailLoading = ref(false)
const activeTab = ref<'overview' | 'plan'>('overview')

const tripId = computed(() => Number(route.params.id))
const trip = computed(() => tripStore.tripById(tripId.value))
const cardBg = computed(() =>
  trip.value ? resolveTripCardBg(trip.value.theme, trip.value.id) : '#f5f6f7',
)
const isEmpty = computed(
  () => !trip.value?.dayPlans.length || trip.value.placeCount === 0,
)

onMounted(async () => {
  if (trip.value || Number.isNaN(tripId.value)) {
    return
  }

  detailLoading.value = true
  try {
    await tripStore.fetchTripById(tripId.value)
  } catch (error) {
    const message = error instanceof ApiError ? error.message : '加载行程失败'
    showToast(message)
  } finally {
    detailLoading.value = false
  }
})

function goBack() {
  router.push('/')
}

async function handleDelete() {
  if (!trip.value) {
    return
  }
  try {
    await showConfirmDialog({
      title: '删除行程',
      message: `确定删除「${trip.value.title}」吗？`,
    })
    await tripStore.removeTrip(trip.value.id)
    showToast('已删除')
    router.push('/')
  } catch (error) {
    if (error instanceof ApiError) {
      showToast(error.message)
    }
  }
}
</script>

<template>
  <van-loading v-if="detailLoading" class="page-loading" vertical>
    加载中...
  </van-loading>

  <div v-else-if="trip" class="detail-page">
    <header class="detail-header">
      <button type="button" class="header-btn" aria-label="返回" @click="goBack">
        <van-icon name="arrow-left" size="20" />
      </button>
      <div class="header-actions">
        <button type="button" class="header-btn" aria-label="分享" @click="showToast('分享开发中')">
          <van-icon name="share-o" size="20" />
        </button>
        <button type="button" class="header-btn" aria-label="设置" @click="handleDelete">
          <van-icon name="delete-o" size="20" />
        </button>
      </div>
    </header>

    <section class="detail-hero" :style="{ background: cardBg }">
      <div class="hero-top">
        <div>
          <h1 class="detail-title">{{ trip.title }}</h1>
          <button type="button" class="date-link" @click="showToast('日期选择开发中')">
            {{ trip.nights === '未设置日期' ? '点击添加日期 >' : `${trip.nights} >` }}
          </button>
        </div>
        <div class="user-chip">
          <img :src="profileStore.avatarUrl" alt="" class="user-chip__avatar" />
          <span>{{ authStore.displayName }}</span>
        </div>
      </div>

      <div class="detail-tabs">
        <button
          type="button"
          class="detail-tab"
          :class="{ active: activeTab === 'overview' }"
          @click="activeTab = 'overview'"
        >
          总览
        </button>
        <button
          type="button"
          class="detail-tab"
          :class="{ active: activeTab === 'plan' }"
          @click="activeTab = 'plan'"
        >
          计划
        </button>
      </div>
    </section>

    <section v-if="activeTab === 'overview'" class="overview-body">
      <div class="overview-card">
        <div class="overview-row">
          <span>行程概览</span>
          <van-icon name="arrow" size="14" color="#c8c9cc" />
        </div>
        <div class="overview-row">
          <span>计划</span>
          <span class="overview-muted">{{ trip.placeCount }} 个地点</span>
        </div>
      </div>

      <div class="feature-grid">
        <div class="feature-card feature-card--note">
          <h3>便签</h3>
          <p>记录你的旅行想法</p>
        </div>
        <div class="feature-card feature-card--pack">
          <h3>行李清单</h3>
          <p>快捷添加出行物品，创建你的私人清单</p>
        </div>
      </div>

      <div class="image-space">
        <div class="image-space__head">
          <span>图片空间 · 0</span>
        </div>
        <button type="button" class="image-space__add" @click="showToast('图片上传开发中')">
          <van-icon name="plus" size="22" color="#969799" />
        </button>
      </div>
    </section>

    <section v-else class="plan-body">
      <div v-if="isEmpty" class="plan-empty">
        <svg class="plan-empty__art" viewBox="0 0 160 120" fill="none" aria-hidden="true">
          <path d="M20 90c30-40 70-50 100-40" stroke="#111" stroke-width="1.5" />
          <rect x="45" y="35" width="70" height="50" rx="4" stroke="#111" stroke-width="1.5" />
          <circle cx="60" cy="50" r="6" stroke="#111" stroke-width="1.5" />
          <path d="M52 70l12-10 10 8 16-18" stroke="#111" stroke-width="1.5" />
        </svg>
        <p class="plan-empty__title">空空如也</p>
        <p class="plan-empty__desc">添加地点/住宿/交通完善计划</p>
      </div>

      <article v-for="day in trip.dayPlans" v-else :key="day.day" class="day-card">
        <div class="day-head">
          <span class="day-badge">Day {{ day.day }}</span>
          <h2 class="day-title">第 {{ day.day }} 天</h2>
        </div>
        <div class="timeline">
          <div v-for="(place, index) in day.places" :key="place" class="timeline-item">
            <div class="timeline-dot" />
            <div class="timeline-content">
              <p class="place-name">{{ place }}</p>
              <p class="place-order">第 {{ index + 1 }} 站</p>
            </div>
          </div>
        </div>
      </article>
    </section>

    <footer class="detail-footer">
      <div class="ai-bar">
        <van-icon name="chat-o" size="18" color="#7C5CBF" />
        <span>给途绘发送消息…</span>
      </div>
      <button type="button" class="edit-btn" @click="showToast('编辑功能开发中')">
        <van-icon name="edit" size="16" />
        编辑
      </button>
    </footer>
  </div>

  <van-empty v-else description="行程不存在">
    <van-button round type="primary" @click="goBack">返回首页</van-button>
  </van-empty>
</template>

<style scoped>
.detail-page {
  min-height: 100vh;
  padding-bottom: 88px;
  background: #fff;
}

.page-loading {
  display: flex;
  justify-content: center;
  padding: 120px 0;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
}

.header-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.detail-hero {
  margin: 0 16px;
  padding: 20px 18px 0;
  border-radius: 20px 20px 0 0;
}

.hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.detail-title {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 800;
  color: #111;
}

.date-link {
  padding: 0;
  border: none;
  background: transparent;
  font-size: 14px;
  color: rgb(0 0 0 / 55%);
  cursor: pointer;
}

.user-chip {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  font-size: 11px;
  color: rgb(0 0 0 / 60%);
}

.user-chip__avatar {
  width: 36px;
  height: 36px;
  border: 2px solid rgb(255 255 255 / 80%);
  border-radius: 50%;
  object-fit: cover;
}

.detail-tabs {
  display: flex;
  gap: 24px;
  border-bottom: 1px solid rgb(0 0 0 / 6%);
}

.detail-tab {
  position: relative;
  padding: 12px 0;
  border: none;
  background: transparent;
  font-size: 15px;
  font-weight: 600;
  color: #969799;
  cursor: pointer;
}

.detail-tab.active {
  color: #111;
}

.detail-tab.active::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 3px;
  border-radius: 999px;
  background: #111;
}

.overview-body,
.plan-body {
  padding: 16px;
}

.overview-card {
  margin-bottom: 14px;
  padding: 4px 16px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 2px 12px rgb(0 0 0 / 5%);
}

.overview-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid #f2f3f5;
  font-size: 15px;
  color: #323233;
}

.overview-row:last-child {
  border-bottom: none;
}

.overview-muted {
  font-size: 13px;
  color: #969799;
}

.feature-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 14px;
}

.feature-card {
  min-height: 120px;
  padding: 16px;
  border-radius: 16px;
}

.feature-card h3 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 700;
  color: #111;
}

.feature-card p {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: rgb(0 0 0 / 55%);
}

.feature-card--note {
  background: #fff9e6;
  background-image: repeating-linear-gradient(
    transparent,
    transparent 22px,
    rgb(0 0 0 / 6%) 22px,
    rgb(0 0 0 / 6%) 23px
  );
}

.feature-card--pack {
  background: #e8f2fc;
}

.image-space {
  padding: 16px;
  border-radius: 16px;
  background: #f7f8fa;
}

.image-space__head {
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #323233;
}

.image-space__add {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border: none;
  border-radius: 14px;
  background: #fff;
  cursor: pointer;
}

.plan-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
}

.plan-empty__art {
  width: 160px;
  height: 120px;
  margin-bottom: 20px;
}

.plan-empty__title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.plan-empty__desc {
  margin: 0;
  font-size: 13px;
  color: #969799;
}

.day-card {
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 16px;
  background: #f7f8fa;
}

.day-head {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 14px;
}

.day-badge {
  padding: 4px 10px;
  border-radius: 20px;
  background: #111;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
}

.day-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.timeline-item {
  display: flex;
  gap: 12px;
  padding-bottom: 16px;
}

.timeline-dot {
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  margin-top: 6px;
  border-radius: 50%;
  background: #111;
}

.place-name {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 500;
}

.place-order {
  margin: 0;
  font-size: 12px;
  color: #969799;
}

.detail-footer {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  display: flex;
  gap: 10px;
  max-width: 480px;
  margin: 0 auto;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  background: rgb(255 255 255 / 96%);
  backdrop-filter: blur(8px);
}

.ai-bar {
  display: flex;
  flex: 1;
  gap: 10px;
  align-items: center;
  padding: 12px 16px;
  border-radius: 999px;
  background: #f2f3f5;
  font-size: 14px;
  color: #969799;
}

.edit-btn {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 12px 18px;
  border: none;
  border-radius: 999px;
  background: #f2f3f5;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
</style>
