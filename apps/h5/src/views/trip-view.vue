<script setup lang="ts">
import { useRouter } from 'vue-router'
import TripCard from '../components/trip-card.vue'
import { useTripStore } from '../stores/trip'

const router = useRouter()
const tripStore = useTripStore()

function openTrip(id: number) {
  router.push(`/trip/${id}`)
}
</script>

<template>
  <div class="trip-page">
    <header class="trip-header">
      <div class="brand">
        <img class="brand-logo" src="/app-logo.svg" alt="途绘" />
        <span class="brand-name">途绘</span>
      </div>
      <div class="header-actions">
        <van-icon name="search" size="22" color="#323233" />
        <img
          class="user-avatar"
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=me"
          alt="头像"
        />
      </div>
    </header>

    <section class="trip-section">
      <div class="section-head">
        <h2 class="section-title">我的计划</h2>
        <button type="button" class="filter-btn">
          <van-icon name="bars" size="14" />
          <span>全部</span>
        </button>
      </div>

      <van-empty v-if="tripStore.trips.length === 0" description="还没有行程，点 + 创建一个吧" />

      <TripCard
        v-for="trip in tripStore.trips"
        :key="trip.id"
        :trip="trip"
        @click="openTrip(trip.id)"
      />
    </section>
  </div>
</template>

<style scoped>
.trip-page {
  min-height: 100vh;
  padding: 12px 16px 80px;
  background: #f5f6f7;
}

.trip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.brand {
  display: flex;
  gap: 6px;
  align-items: center;
}

.brand-logo {
  width: 28px;
  height: 28px;
  border-radius: 8px;
}

.brand-name {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
}

.header-actions {
  display: flex;
  gap: 14px;
  align-items: center;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
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
  padding: 6px 12px;
  border: none;
  border-radius: 20px;
  background: #fff;
  font-size: 13px;
  color: #646566;
  box-shadow: 0 1px 4px rgb(0 0 0 / 6%);
  cursor: pointer;
}
</style>
