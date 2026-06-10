<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import { useTripStore } from '../stores/trip'

const route = useRoute()
const router = useRouter()
const tripStore = useTripStore()

const tripId = computed(() => Number(route.params.id))
const trip = computed(() => tripStore.tripById(tripId.value))

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
    tripStore.removeTrip(trip.value.id)
    showToast('已删除')
    router.push('/')
  } catch {
    // 用户取消
  }
}
</script>

<template>
  <div v-if="trip" class="detail-page">
    <van-nav-bar
      title="行程详情"
      left-arrow
      fixed
      placeholder
      @click-left="goBack"
    />

    <div class="detail-hero" :style="{ background: trip.theme }">
      <h1 class="detail-title">{{ trip.title }}</h1>
      <p class="detail-meta">{{ trip.nights }} · {{ trip.placeCount }} 个地点</p>
      <p v-if="trip.preferences.length" class="detail-prefs">
        偏好：{{ trip.preferences.join('、') }}
      </p>
    </div>

    <section class="day-list">
      <article v-for="day in trip.dayPlans" :key="day.day" class="day-card">
        <h2 class="day-title">第 {{ day.day }} 天</h2>
        <van-cell-group inset>
          <van-cell
            v-for="(place, index) in day.places"
            :key="place"
            :title="place"
            :label="`第 ${index + 1} 站`"
          />
        </van-cell-group>
      </article>
    </section>

    <div class="detail-actions">
      <van-button type="danger" block round plain @click="handleDelete">
        删除行程
      </van-button>
      <p class="detail-tip">Day 4：以上为模拟数据，后续由 AI 生成</p>
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
  padding-top: 8px;
}

.day-card {
  margin-bottom: 8px;
}

.day-title {
  margin: 16px 16px 10px;
  font-size: 16px;
  font-weight: 600;
  color: #323233;
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
