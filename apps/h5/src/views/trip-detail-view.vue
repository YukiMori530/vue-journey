<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import ConfirmDialog from '../components/confirm-dialog.vue'
import TripDetailMap from '../components/trip-detail-map.vue'
import TripDayItinerary from '../components/trip-day-itinerary.vue'
import { useTripStore } from '../stores/trip'
import { useAuthStore } from '../stores/auth'
import { useProfileStore } from '../stores/profile'
import { ApiError } from '../api/client'

const route = useRoute()
const router = useRouter()
const tripStore = useTripStore()
const authStore = useAuthStore()
const profileStore = useProfileStore()
const detailLoading = ref(false)
const selectedTab = ref<'overview' | number>('overview')
const showDeleteDialog = ref(false)

const tripId = computed(() => Number(route.params.id))
const trip = computed(() => tripStore.tripById(tripId.value))
const isEmpty = computed(
  () => !trip.value?.dayPlans.length || trip.value.placeCount === 0,
)
const showMap = computed(() => selectedTab.value !== 'overview' && !isEmpty.value)
const dayNumbers = computed(() => trip.value?.dayPlans.map((day) => day.day) ?? [])

onMounted(async () => {
  const dayQuery = Number(route.query.day)
  if (dayQuery >= 1) {
    selectedTab.value = dayQuery
  } else if (route.query.tab === 'map') {
    selectedTab.value = 1
  }

  if (trip.value || Number.isNaN(tripId.value)) {
    return
  }

  detailLoading.value = true
  try {
    await tripStore.fetchTripById(tripId.value)
    if (dayQuery >= 1) {
      selectedTab.value = dayQuery
    }
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

function selectTab(tab: 'overview' | number) {
  selectedTab.value = tab
}

function openDeleteDialog() {
  showDeleteDialog.value = true
}

async function confirmDelete() {
  if (!trip.value) {
    return
  }
  try {
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
    <section v-if="showMap" class="map-section">
      <header class="map-header">
        <button type="button" class="header-btn header-btn--float" aria-label="返回" @click="goBack">
          <van-icon name="arrow-left" size="20" />
        </button>
        <div class="header-actions">
          <button type="button" class="header-btn header-btn--float" aria-label="分享" @click="showToast('分享开发中')">
            <van-icon name="share-o" size="20" />
          </button>
          <button type="button" class="header-btn header-btn--float" aria-label="删除" @click="openDeleteDialog">
            <van-icon name="delete-o" size="20" />
          </button>
        </div>
      </header>
      <TripDetailMap :trip="trip" :day="selectedTab as number" />
    </section>

    <header v-else class="detail-header">
      <button type="button" class="header-btn" aria-label="返回" @click="goBack">
        <van-icon name="arrow-left" size="20" />
      </button>
      <div class="header-actions">
        <button type="button" class="header-btn" aria-label="分享" @click="showToast('分享开发中')">
          <van-icon name="share-o" size="20" />
        </button>
        <button type="button" class="header-btn" aria-label="删除" @click="openDeleteDialog">
          <van-icon name="delete-o" size="20" />
        </button>
      </div>
    </header>

    <section class="detail-panel" :class="{ 'detail-panel--overlap': showMap }">
      <div class="panel-header">
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
          :class="{ active: selectedTab === 'overview' }"
          @click="selectTab('overview')"
        >
          总览
        </button>
        <button
          v-for="day in dayNumbers"
          :key="day"
          type="button"
          class="detail-tab"
          :class="{ active: selectedTab === day }"
          @click="selectTab(day)"
        >
          DAY {{ day }}
        </button>
      </div>

      <div class="panel-body">
        <div v-if="selectedTab === 'overview'" class="overview-body">
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
              <p>快捷添加出行物品</p>
            </div>
          </div>
        </div>

        <div v-else-if="isEmpty" class="plan-empty">
          <p class="plan-empty__title">空空如也</p>
          <p class="plan-empty__desc">添加地点/住宿/交通完善计划</p>
        </div>

        <TripDayItinerary v-else :trip="trip" :day="selectedTab as number" />
      </div>
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

    <ConfirmDialog
      v-model:show="showDeleteDialog"
      title="删除行程"
      :message="`确定删除「${trip.title}」吗？`"
      confirm-text="删除"
      variant="danger"
      @confirm="confirmDelete"
    />
  </div>

  <van-empty v-else description="行程不存在">
    <van-button round type="primary" @click="goBack">返回首页</van-button>
  </van-empty>
</template>

<style scoped>
.detail-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-bottom: 88px;
  background: #f5f6f7;
}

.page-loading {
  display: flex;
  justify-content: center;
  padding: 120px 0;
}

.map-section {
  position: relative;
  flex-shrink: 0;
  height: 42vh;
  min-height: 260px;
}

.map-header {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #fff;
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

.header-btn--float {
  border-radius: 50%;
  background: rgb(255 255 255 / 92%);
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}

.header-actions {
  display: flex;
  gap: 8px;
}

.detail-panel {
  flex: 1;
  background: #fff;
}

.detail-panel--overlap {
  margin-top: -18px;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -4px 20px rgb(0 0 0 / 6%);
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 18px 0;
}

.detail-title {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 800;
  color: #111;
}

.date-link {
  padding: 0;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #969799;
  cursor: pointer;
}

.user-chip {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  font-size: 11px;
  color: #646566;
}

.user-chip__avatar {
  width: 36px;
  height: 36px;
  border: 2px solid #fff;
  border-radius: 50%;
  object-fit: cover;
}

.detail-tabs {
  display: flex;
  gap: 20px;
  padding: 16px 18px 0;
  overflow-x: auto;
  scrollbar-width: none;
  border-bottom: 1px solid #f2f3f5;
}

.detail-tabs::-webkit-scrollbar {
  display: none;
}

.detail-tab {
  position: relative;
  flex-shrink: 0;
  padding: 10px 0 12px;
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
  background: #1989fa;
}

.panel-body {
  padding: 16px 18px;
}

.overview-card {
  margin-bottom: 14px;
  padding: 4px 16px;
  border-radius: 16px;
  background: #f7f8fa;
}

.overview-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid #eee;
  font-size: 15px;
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
}

.feature-card {
  min-height: 100px;
  padding: 16px;
  border-radius: 16px;
}

.feature-card h3 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 700;
}

.feature-card p {
  margin: 0;
  font-size: 12px;
  color: #646566;
}

.feature-card--note {
  background: #fff9e6;
}

.feature-card--pack {
  background: #e8f2fc;
}

.plan-empty {
  padding: 48px 16px;
  text-align: center;
}

.plan-empty__title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
}

.plan-empty__desc {
  margin: 0;
  font-size: 13px;
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
