<script setup lang="ts">
import { computed } from 'vue'
import type { DayPlan, Trip } from '../types/trip'
import { enrichDayPlan } from '../utils/enrich-trip-stops'

const props = defineProps<{
  trip: Trip
  day: number
}>()

const dayPlan = computed(() => props.trip.dayPlans.find((item) => item.day === props.day))

const enriched = computed(() => {
  if (!dayPlan.value) {
    return null
  }
  return enrichDayPlan(dayPlan.value as DayPlan, props.trip.destination)
})
</script>

<template>
  <div v-if="enriched" class="day-itinerary">
    <h2 class="day-itinerary__title">{{ enriched.title }}</h2>

    <template v-for="(stop, index) in enriched.places" :key="`${stop.name}-${index}`">
      <div v-if="index > 0 && stop.distanceKm" class="travel-segment">
        <van-icon name="logistics" size="14" color="#969799" />
        <span>{{ stop.distanceKm }} 公里 · {{ stop.driveMinutes }} 分钟</span>
        <van-icon name="arrow" size="12" color="#c8c9cc" />
      </div>

      <article class="stop-card">
        <img v-if="stop.cover" class="stop-card__cover" :src="stop.cover" :alt="stop.name" />
        <div class="stop-card__body">
          <div class="stop-card__head">
            <h3>{{ index + 1 }}. {{ stop.name }}</h3>
            <span v-if="stop.categoryLabel" class="stop-tag">{{ stop.categoryLabel }}</span>
          </div>
          <p v-if="stop.startTime && stop.endTime" class="stop-time">
            {{ stop.startTime }} - {{ stop.endTime }}
          </p>
          <p class="stop-desc">{{ stop.description }}</p>
        </div>
        <button type="button" class="stop-edit" aria-label="编辑">
          <van-icon name="edit" size="14" color="#969799" />
        </button>
      </article>
    </template>
  </div>
</template>

<style scoped>
.day-itinerary {
  padding-bottom: 16px;
}

.day-itinerary__title {
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 700;
  color: #111;
}

.travel-segment {
  display: flex;
  gap: 6px;
  align-items: center;
  margin: 8px 0 8px 4px;
  font-size: 12px;
  color: #969799;
}

.stop-card {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 2px 12px rgb(0 0 0 / 5%);
}

.stop-card__cover {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
}

.stop-card__body {
  flex: 1;
  min-width: 0;
}

.stop-card__head {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 4px;
}

.stop-card__head h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #111;
}

.stop-tag {
  padding: 2px 8px;
  border-radius: 999px;
  background: #f2f3f5;
  font-size: 11px;
  color: #646566;
}

.stop-time {
  margin: 0 0 6px;
  font-size: 12px;
  color: #969799;
}

.stop-desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: #646566;
}

.stop-edit {
  flex-shrink: 0;
  padding: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
}
</style>
