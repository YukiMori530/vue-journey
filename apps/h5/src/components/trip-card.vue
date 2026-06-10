<script setup lang="ts">
import type { Trip } from '../types/trip'

defineProps<{
  trip: Trip
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <article class="trip-card" :style="{ background: trip.theme }" @click="emit('click')">
    <div class="trip-card__info">
      <h3 class="trip-card__title">{{ trip.title }}</h3>
      <p class="trip-card__meta">
        <span>{{ trip.nights }}</span>
        <span class="dot">·</span>
        <span>{{ trip.placeCount }} 个地点</span>
      </p>
      <div class="trip-card__members">
        <img
          class="member-avatar"
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=user1"
          alt="成员"
        />
        <button type="button" class="member-add" aria-label="邀请同行" @click.stop>
          <van-icon name="plus" size="14" />
        </button>
      </div>
    </div>
    <img class="trip-card__cover" :src="trip.cover" :alt="trip.title" />
  </article>
</template>

<style scoped>
.trip-card {
  position: relative;
  display: flex;
  min-height: 148px;
  padding: 20px 16px;
  margin-bottom: 16px;
  overflow: hidden;
  border-radius: 20px;
  cursor: pointer;
}

.trip-card:active {
  opacity: 0.92;
}

.trip-card__info {
  z-index: 1;
  flex: 1;
  max-width: 58%;
}

.trip-card__title {
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.4;
  color: #1a1a1a;
}

.trip-card__meta {
  display: flex;
  gap: 4px;
  align-items: center;
  margin: 0 0 16px;
  font-size: 13px;
  color: #5a7a72;
}

.dot {
  opacity: 0.6;
}

.trip-card__members {
  display: flex;
  gap: 8px;
  align-items: center;
}

.member-avatar {
  width: 28px;
  height: 28px;
  border: 2px solid #fff;
  border-radius: 50%;
  object-fit: cover;
}

.member-add {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: rgb(255 255 255 / 70%);
  color: #666;
  cursor: pointer;
}

.trip-card__cover {
  position: absolute;
  top: 12px;
  right: -8px;
  width: 130px;
  height: 118px;
  object-fit: cover;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
  transform: rotate(8deg);
}
</style>
