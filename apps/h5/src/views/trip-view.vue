<script setup lang="ts">
import TripCard from '../components/trip-card.vue'
import type { TripCardData } from '../components/trip-card.vue'

const trips: TripCardData[] = [
  {
    id: 1,
    title: '烟台三日海韵慢行',
    nights: '3天2晚',
    placeCount: 13,
    cover: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&q=80',
    theme: 'linear-gradient(135deg, #d4ede8 0%, #c5e8e0 100%)',
  },
  {
    id: 2,
    title: '成都美食周末游',
    nights: '2天1晚',
    placeCount: 8,
    cover: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&q=80',
    theme: 'linear-gradient(135deg, #fdebd3 0%, #f9dcc4 100%)',
  },
]
</script>

<template>
  <div class="trip-page">
    <header class="trip-header">
      <div class="brand">
        <span class="brand-icon">⛰️</span>
        <span class="brand-name">圆周旅迹</span>
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

      <TripCard v-for="trip in trips" :key="trip.id" :trip="trip" />
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

.brand-icon {
  font-size: 22px;
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
