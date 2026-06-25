<script setup lang="ts">
import { computed } from 'vue'
import type { TripStop } from '../types/trip'
import PlaceCoverImage from './place-cover-image.vue'
import { enrichStop } from '../utils/enrich-trip-stops'
import { formatStopDisplayName } from '../utils/display-stop-name'

const props = defineProps<{
  title: string
  destination: string
  stops: TripStop[]
}>()

const emit = defineEmits<{
  open: [payload: { stop: TripStop; index: number }]
  edit: [payload: { stop: TripStop; index: number }]
}>()

const enrichedStops = computed(() =>
  props.stops.map((stop, index) => enrichStop(stop, index, props.destination)),
)

function displayName(stop: TripStop) {
  return formatStopDisplayName(stop.name, props.destination)
}

function onOpen(stop: TripStop, index: number) {
  emit('open', { stop, index })
}

function onEdit(event: Event, stop: TripStop, index: number) {
  event.stopPropagation()
  emit('edit', { stop, index })
}
</script>

<template>
  <div class="day-itinerary">
    <h2 class="day-itinerary__title">{{ title }}</h2>

    <template v-for="(stop, index) in enrichedStops" :key="`${stop.name}-${index}`">
      <div v-if="index > 0 && stop.distanceKm" class="travel-segment">
        <van-icon name="logistics" size="14" color="#969799" />
        <span>{{ stop.distanceKm }} 公里 · {{ stop.driveMinutes }} 分钟</span>
        <van-icon name="arrow" size="12" color="#c8c9cc" />
      </div>

      <article class="stop-card" role="button" tabindex="0" @click="onOpen(stop, index)">
        <PlaceCoverImage
          class="stop-card__cover"
          :name="stop.name"
          :destination="destination"
          :category="stop.category"
        />
        <div class="stop-card__body">
          <div class="stop-card__head">
            <h3>{{ index + 1 }}. {{ displayName(stop) }}</h3>
            <span v-if="stop.categoryLabel" class="stop-tag">{{ stop.categoryLabel }}</span>
          </div>
          <p v-if="stop.startTime && stop.endTime" class="stop-time">
            {{ stop.startTime }} - {{ stop.endTime }}
          </p>
          <p v-if="stop.lng == null || stop.lat == null" class="stop-unlocated">
            暂未在地图上定位
          </p>
          <p class="stop-desc">{{ stop.description }}</p>
        </div>
        <button
          type="button"
          class="stop-edit"
          aria-label="编辑"
          @click="onEdit($event, stop, index)"
        >
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
  cursor: pointer;
}

.stop-card__cover {
  width: 72px;
  height: 72px;
  border-radius: 12px;
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

.stop-unlocated {
  margin: 0 0 6px;
  font-size: 12px;
  color: #ed6a0c;
}

.stop-desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: #646566;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
}

.stop-edit {
  flex-shrink: 0;
  padding: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
}
</style>
