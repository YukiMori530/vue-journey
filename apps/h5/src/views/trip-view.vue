<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import TripCard from '../components/trip-card.vue'
import AppHeader from '../components/app-header.vue'
import { useTripStore } from '../stores/trip'
import { ApiError } from '../api/client'

const router = useRouter()
const tripStore = useTripStore()

onMounted(async () => {
  try {
    await tripStore.fetchTrips()
  } catch (error) {
    const message =
      error instanceof ApiError ? error.message : '加载行程失败，请确认后端已启动'
    showToast(message)
  }
})

function openTrip(id: number) {
  router.push(`/trip/${id}`)
}
</script>

<template>
  <div class="trip-page">
    <AppHeader />

    <section class="trip-section">
      <div class="section-head">
        <h2 class="section-title">我的计划</h2>
        <button type="button" class="filter-btn">
          <van-icon name="bars" size="14" />
          <span>全部</span>
        </button>
      </div>

      <van-loading v-if="tripStore.loading" class="page-loading" vertical>
        加载中...
      </van-loading>

      <van-empty
        v-else-if="tripStore.trips.length === 0"
        description="还没有行程，点 + 创建一个吧"
      />

      <template v-else>
        <TripCard
          v-for="trip in tripStore.trips"
          :key="trip.id"
          :trip="trip"
          @click="openTrip(trip.id)"
        />
      </template>
    </section>
  </div>
</template>

<style scoped>
.trip-page {
  min-height: 100vh;
  padding: 8px 16px 80px;
  background: #f5f6f7;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
}

.filter-btn {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 8px 14px;
  border: none;
  border-radius: 20px;
  background: #fff;
  font-size: 13px;
  color: #646566;
  box-shadow: 0 1px 4px rgb(0 0 0 / 6%);
  cursor: pointer;
}

.page-loading {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}
</style>
