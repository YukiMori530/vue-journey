<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import ConfirmDialog from '../components/confirm-dialog.vue'
import TripChatSheet from '../components/trip-chat-sheet.vue'
import TripOverviewMap from '../components/trip-overview-map.vue'
import TripOverviewBody from '../components/trip-overview-body.vue'
import TripDayItinerary from '../components/trip-day-itinerary.vue'
import StopDetailSheet from '../components/stop-detail-sheet.vue'
import { useResolvedTripStops } from '../composables/use-resolved-trip-stops'
import { useTripStore } from '../stores/trip'
import { useAuthStore } from '../stores/auth'
import { useProfileStore } from '../stores/profile'
import { enrichDayPlan } from '../utils/enrich-trip-stops'
import { formatStopDisplayName } from '../utils/display-stop-name'
import { pickRevisionFocusDay } from '../utils/pick-revision-focus-day'
import { showAppFailToast, showAppSuccessToast } from '../utils/app-toast'
import { ApiError } from '../api/client'
import type { TripStop } from '../types/trip'

const route = useRoute()
const router = useRouter()
const tripStore = useTripStore()
const authStore = useAuthStore()
const profileStore = useProfileStore()
const detailLoading = ref(false)
const selectedTab = ref<'overview' | 'pending' | number>('overview')
const showDeleteDialog = ref(false)
const deleting = ref(false)
const showChatSheet = ref(false)
const revising = ref(false)
const chatSheetRef = ref<InstanceType<typeof TripChatSheet> | null>(null)
const chatDraftMessage = ref('')
const showStopDetail = ref(false)
const selectedStop = ref<{ stop: TripStop; index: number } | null>(null)

const tripId = computed(() => Number(route.params.id))
const trip = computed(() => tripStore.tripById(tripId.value))
const isEmpty = computed(
  () => !trip.value?.dayPlans.length || trip.value.placeCount === 0,
)
const showMap = computed(() => !isEmpty.value)
const dayNumbers = computed(() => trip.value?.dayPlans.map((day) => day.day) ?? [])

const { days: resolvedDays, loading: stopsLoading } = useResolvedTripStops(trip)

const activeDay = computed(() => {
  if (typeof selectedTab.value === 'number') {
    return selectedTab.value
  }
  return 1
})

const mapHighlightDay = computed(() =>
  selectedTab.value === 'overview' ? null : activeDay.value,
)

const activeDayPlan = computed(() => {
  if (!trip.value || selectedTab.value === 'overview' || selectedTab.value === 'pending') {
    return null
  }
  return trip.value.dayPlans.find((item) => item.day === selectedTab.value) ?? null
})

const activeDayStops = computed(
  () => resolvedDays.value.find((day) => day.day === activeDay.value)?.stops ?? [],
)

const activeDayTitle = computed(() => {
  if (!trip.value || !activeDayPlan.value) {
    return ''
  }
  return enrichDayPlan(activeDayPlan.value, trip.value.destination).title
})

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

function selectTab(tab: 'overview' | 'pending' | number) {
  selectedTab.value = tab
}

function selectDayFromOverview(day: number) {
  selectedTab.value = day
}

function openChatSheet(draft?: string) {
  if (isEmpty.value) {
    showAppFailToast('先添加地点再调整行程')
    return
  }
  chatDraftMessage.value = draft?.trim() ?? ''
  showChatSheet.value = true
}

function clearChatDraft() {
  chatDraftMessage.value = ''
}

function openStopDetail(payload: { stop: TripStop; index: number }) {
  selectedStop.value = payload
  showStopDetail.value = true
}

function editStopFromSheet() {
  if (!selectedStop.value || !trip.value) {
    return
  }
  editStop(selectedStop.value)
  showStopDetail.value = false
}

function editStop(payload: { stop: TripStop; index: number }) {
  if (!trip.value) {
    return
  }
  const displayName = formatStopDisplayName(payload.stop.name, trip.value.destination)
  const day = activeDay.value
  openChatSheet(
    `请优化 DAY ${day} 第 ${payload.index + 1} 站「${displayName}」：说明停留时长、顺序或替换为更合适的地点。`,
  )
}

async function handleRevise(message: string) {
  if (!trip.value || revising.value) {
    return
  }
  revising.value = true
  const beforePlans = trip.value.dayPlans.map((day) => ({
    ...day,
    places: [...day.places],
  }))
  try {
    const updated = await tripStore.reviseTrip(trip.value.id, message, (log) => {
      chatSheetRef.value?.appendThinkingStep(log.text)
    })
    const focusDay = pickRevisionFocusDay(beforePlans, updated, message)
    showChatSheet.value = false
    selectedTab.value = focusDay
    showAppSuccessToast('行程已更新')
  } catch (error) {
    chatSheetRef.value?.failThinking(
      error instanceof ApiError ? error.message : '修改失败，请稍后再试',
    )
  } finally {
    revising.value = false
  }
}

function openDeleteDialog() {
  showDeleteDialog.value = true
}

function openAdjustSheet() {
  clearChatDraft()
  openChatSheet()
}

async function handleReviseSubmit(message: string) {
  await handleRevise(message)
}

async function confirmDelete() {
  if (!trip.value || deleting.value) {
    return
  }
  deleting.value = true
  const title = trip.value.title
  try {
    await tripStore.removeTrip(trip.value.id)
    showDeleteDialog.value = false
    await router.replace({ path: '/' })
    await nextTick()
    showAppSuccessToast(`「${title}」已移除`)
  } catch (error) {
    if (error instanceof ApiError) {
      showAppFailToast(error.message)
    }
  } finally {
    deleting.value = false
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
      <TripOverviewMap
        :days="resolvedDays"
        :destination="trip.destination"
        :highlight-day="mapHighlightDay"
        :loading="stopsLoading"
      />
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
        <button
          type="button"
          class="detail-tab"
          :class="{ active: selectedTab === 'pending' }"
          @click="selectTab('pending')"
        >
          待计划
        </button>
      </div>

      <div class="panel-body">
        <TripOverviewBody
          v-if="selectedTab === 'overview' && !isEmpty"
          :trip="trip"
          :days="resolvedDays"
          @select-day="selectDayFromOverview"
        />

        <div v-else-if="selectedTab === 'overview' && isEmpty" class="plan-empty">
          <p class="plan-empty__title">空空如也</p>
          <p class="plan-empty__desc">添加地点/住宿/交通完善计划</p>
        </div>

        <div v-else-if="selectedTab === 'pending'" class="pending-body">
          <div class="pending-icon" aria-hidden="true">
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="8" width="64" height="64" rx="8" stroke="#c8c9cc" stroke-width="2" stroke-dasharray="4 4" />
              <path d="M24 52 L40 28 L56 52 Z" stroke="#969799" stroke-width="2" fill="none" />
              <circle cx="56" cy="24" r="6" stroke="#969799" stroke-width="2" fill="none" />
            </svg>
          </div>
          <p class="pending-body__hint">把还没排进日程的地点放在这里</p>
          <button type="button" class="pending-body__btn" @click="showToast('添加地点开发中')">
            添加待计划
          </button>
        </div>

        <div v-else-if="isEmpty" class="plan-empty">
          <p class="plan-empty__title">空空如也</p>
          <p class="plan-empty__desc">添加地点/住宿/交通完善计划</p>
        </div>

        <TripDayItinerary
          v-else
          :title="activeDayTitle"
          :destination="trip.destination"
          :stops="activeDayStops"
          @open="openStopDetail"
          @edit="editStop"
        />
      </div>
    </section>

    <footer class="detail-footer">
      <button type="button" class="ai-bar" @click="openAdjustSheet">
        <van-icon name="chat-o" size="18" color="#7C5CBF" />
        <span>给途绘发送消息…</span>
      </button>
      <button type="button" class="edit-btn" @click="openAdjustSheet">
        <van-icon name="edit" size="16" />
        调整
      </button>
    </footer>

    <TripChatSheet
      ref="chatSheetRef"
      v-model:show="showChatSheet"
      :trip="trip"
      :busy="revising"
      :draft-message="chatDraftMessage"
      @submit="handleReviseSubmit"
    />

    <StopDetailSheet
      v-model:show="showStopDetail"
      :stop="selectedStop?.stop ?? null"
      :index="selectedStop?.index ?? 0"
      :destination="trip.destination"
      @edit="editStopFromSheet"
    />

    <ConfirmDialog
      v-model:show="showDeleteDialog"
      title="删除行程"
      :message="`删除后无法恢复，确定移除「${trip.title}」吗？`"
      confirm-text="确认删除"
      variant="danger"
      :loading="deleting"
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

.pending-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 16px;
  text-align: center;
}

.pending-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
}

.pending-icon svg {
  width: 100%;
  height: 100%;
}

.pending-body__hint {
  margin: 0 0 20px;
  font-size: 14px;
  color: #646566;
}

.pending-body__btn {
  padding: 12px 24px;
  border: none;
  border-radius: 999px;
  background: #111;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
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
  border: none;
  border-radius: 999px;
  background: #f2f3f5;
  font-size: 14px;
  color: #969799;
  cursor: pointer;
  text-align: left;
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
