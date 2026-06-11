<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import { useTripStore } from '../stores/trip'
import { ApiError } from '../api/client'

const route = useRoute()
const router = useRouter()
const tripStore = useTripStore()
const detailLoading = ref(false)

const tripId = computed(() => Number(route.params.id))
const trip = computed(() => tripStore.tripById(tripId.value))

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
    <van-nav-bar title="行程详情" left-arrow fixed placeholder @click-left="goBack" />

    <div class="detail-hero" :style="{ background: trip.theme }">
      <h1 class="detail-title">{{ trip.title }}</h1>
      <p class="detail-meta">{{ trip.nights }} · {{ trip.placeCount }} 个地点</p>
      <p v-if="trip.preferences.length" class="detail-prefs">
        偏好：{{ trip.preferences.join('、') }}
      </p>
    </div>

    <section class="day-list">
      <article v-for="day in trip.dayPlans" :key="day.day" class="day-card">
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

    <div class="detail-actions">
      <van-button type="danger" block round plain @click="handleDelete">
        删除行程
      </van-button>
      <p class="detail-tip">后续接入 DeepSeek，AI 自动生成每日路线</p>
    </div>
  </div>

  <van-empty v-else description="行程不存在">
    <van-button round type="primary" @click="goBack">返回首页</van-button>
  </van-empty>
</template>

<style scoped>
.detail-page {
  min-height: 100vh;
  padding-bottom: 32px;
  background: #f5f6f7;
}

.page-loading {
  display: flex;
  justify-content: center;
  padding: 120px 0;
}

.detail-hero {
  margin: 12px 16px 0;
  padding: 24px 20px;
  border-radius: 20px;
}

.detail-title {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
}

.detail-meta,
.detail-prefs {
  margin: 0;
  font-size: 13px;
  color: #5a7a72;
}

.detail-prefs {
  margin-top: 6px;
}

.day-list {
  padding: 8px 16px 0;
}

.day-card {
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 16px;
  background: #fff;
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
  color: #323233;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.timeline-item {
  display: flex;
  gap: 12px;
  padding-bottom: 16px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-dot {
  position: relative;
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  margin-top: 6px;
  border-radius: 50%;
  background: #6aabf5;
}

.timeline-item:not(:last-child) .timeline-dot::after {
  content: '';
  position: absolute;
  top: 12px;
  left: 4px;
  width: 2px;
  height: calc(100% + 10px);
  background: #ebedf0;
}

.timeline-content {
  flex: 1;
  padding-bottom: 4px;
}

.place-name {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 500;
  color: #323233;
}

.place-order {
  margin: 0;
  font-size: 12px;
  color: #969799;
}

.detail-actions {
  padding: 24px 16px 0;
}

.detail-tip {
  margin: 16px 0 0;
  font-size: 12px;
  color: #969799;
  text-align: center;
}
</style>
