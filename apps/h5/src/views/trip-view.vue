<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import TripCard from '../components/trip-card.vue'
import AppHeader from '../components/app-header.vue'
import { useTripStore } from '../stores/trip'
import { useAuthStore } from '../stores/auth'
import { ApiError } from '../api/client'
import { showAppFailToast, flushPendingAppToast } from '../utils/app-toast'

type TripFilter = 'all' | 'planned' | 'empty' | 'recent'

const FILTER_OPTIONS: Array<{ value: TripFilter; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'recent', label: '最近更新' },
  { value: 'planned', label: '已规划' },
  { value: 'empty', label: '空计划' },
]

const router = useRouter()
const tripStore = useTripStore()
const authStore = useAuthStore()

const tripFilter = ref<TripFilter>('all')
const showFilterSheet = ref(false)

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const filterLabel = computed(
  () => FILTER_OPTIONS.find((item) => item.value === tripFilter.value)?.label ?? '全部',
)

const filteredTrips = computed(() => {
  const list = [...tripStore.trips]
  switch (tripFilter.value) {
    case 'planned':
      return list.filter((trip) => trip.placeCount > 0)
    case 'empty':
      return list.filter((trip) => trip.placeCount === 0)
    case 'recent':
      return list.sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
    default:
      return list
  }
})

onMounted(async () => {
  flushPendingAppToast()
  try {
    await tripStore.fetchTrips()
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      authStore.logout()
      showAppFailToast('登录已失效，请重新登录')
      router.replace('/login')
      return
    }
    const message =
      error instanceof ApiError ? error.message : '加载行程失败，请确认后端已启动'
    showAppFailToast(message)
  }
})

function openTrip(id: number) {
  router.push(`/trip/${id}`)
}

function onFilterSelect(action: { name: string }) {
  const next = FILTER_OPTIONS.find((item) => item.label === action.name)
  if (next) {
    tripFilter.value = next.value
  }
  showFilterSheet.value = false
}
</script>

<template>
  <div class="trip-page">
    <div class="page-bg" aria-hidden="true">
      <span class="blob blob-a" />
      <span class="blob blob-b" />
    </div>

    <div class="page-content">
      <AppHeader />

      <section class="trip-hero">
        <p class="trip-greeting">{{ greeting }}，{{ authStore.displayName }}</p>
        <div class="hero-row">
          <h2 class="section-title">我的计划</h2>
          <button type="button" class="filter-chip" @click="showFilterSheet = true">
            <van-icon name="exchange" size="14" />
            {{ filterLabel }}
          </button>
        </div>
      </section>

      <section class="trip-section">
        <van-loading v-if="tripStore.loading" class="page-loading" vertical color="#1989fa">
          加载中...
        </van-loading>

        <div v-else-if="tripStore.trips.length === 0" class="empty-wrap">
          <van-empty description="还没有行程">
            <template #image>
              <div class="empty-icon">
                <van-icon name="bag-o" size="48" color="#1989fa" />
              </div>
            </template>
          </van-empty>
          <p class="empty-tip">点击底部 + 创建你的第一个计划</p>
        </div>

        <div v-else-if="filteredTrips.length === 0" class="empty-wrap">
          <van-empty :description="`暂无${filterLabel}的行程`" />
        </div>

        <div v-else class="trip-list">
          <TripCard
            v-for="trip in filteredTrips"
            :key="trip.id"
            :trip="trip"
            @click="openTrip(trip.id)"
          />
        </div>
      </section>
    </div>

    <van-action-sheet
      v-model:show="showFilterSheet"
      :actions="FILTER_OPTIONS.map((item) => ({ name: item.label }))"
      cancel-text="取消"
      close-on-click-action
      @select="onFilterSelect"
    />
  </div>
</template>

<style scoped>
.trip-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: linear-gradient(180deg, #e8f2ff 0%, #f5f7fa 28%, #f5f7fa 100%);
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
  opacity: 0.45;
}

.blob-a {
  top: -80px;
  right: -60px;
  width: 240px;
  height: 240px;
  background: #9ec9ff;
}

.blob-b {
  top: 120px;
  left: -80px;
  width: 200px;
  height: 200px;
  background: #c8daf5;
}

.page-content {
  position: relative;
  z-index: 1;
  padding: 8px 16px 88px;
}

.trip-hero {
  margin-bottom: 20px;
}

.trip-greeting {
  margin: 0 0 6px;
  font-size: 14px;
  color: #646566;
}

.hero-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.section-title {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  color: #111;
  letter-spacing: 0.3px;
}

.trip-count,
.filter-chip {
  flex-shrink: 0;
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 6px 12px;
  border: none;
  border-radius: 999px;
  background: rgb(255 255 255 / 85%);
  font-size: 12px;
  font-weight: 500;
  color: #646566;
  box-shadow: 0 2px 8px rgb(0 0 0 / 5%);
  cursor: pointer;
}

.trip-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-loading {
  display: flex;
  justify-content: center;
  padding: 64px 0;
}

.empty-wrap {
  padding: 32px 0 16px;
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  margin: 0 auto;
  border-radius: 50%;
  background: rgb(25 137 250 / 10%);
}

.empty-tip {
  margin: 8px 0 0;
  font-size: 13px;
  text-align: center;
  color: #969799;
}
</style>
