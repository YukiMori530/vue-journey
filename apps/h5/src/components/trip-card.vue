<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Trip } from '../types/trip'
import { getTripCoverCandidates } from '../utils/trip-covers'

const props = defineProps<{
  trip: Trip
}>()

const emit = defineEmits<{
  click: []
}>()

const coverIndex = ref(0)

const coverCandidates = computed(() => getTripCoverCandidates(props.trip))

const currentCover = computed(
  () => coverCandidates.value[coverIndex.value] ?? '/covers/default.jpg',
)

watch(
  () => props.trip.id,
  () => {
    coverIndex.value = 0
  },
)

function onCoverError() {
  if (coverIndex.value < coverCandidates.value.length - 1) {
    coverIndex.value += 1
  }
}
</script>

<template>
  <article class="trip-card" @click="emit('click')">
    <div class="trip-card__media" :style="{ background: trip.theme }">
      <img
        class="trip-card__cover"
        :src="currentCover"
        :alt="trip.title"
        loading="lazy"
        @error="onCoverError"
      />
      <div class="trip-card__overlay" />
      <span class="trip-card__dest">{{ trip.destination }}</span>
      <span v-if="trip.preferences[0]" class="trip-card__tag">
        {{ trip.preferences[0] }}
      </span>
    </div>

    <div class="trip-card__body">
      <h3 class="trip-card__title">{{ trip.title }}</h3>
      <div class="trip-card__meta">
        <span class="meta-item">
          <van-icon name="clock-o" size="14" />
          {{ trip.nights }}
        </span>
        <span class="meta-dot" />
        <span class="meta-item">
          <van-icon name="location-o" size="14" />
          {{ trip.placeCount }} 个地点
        </span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.trip-card {
  overflow: hidden;
  border-radius: 20px;
  background: #fff;
  box-shadow:
    0 8px 24px rgb(25 137 250 / 8%),
    0 2px 8px rgb(0 0 0 / 4%);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.trip-card:active {
  transform: scale(0.985);
}

.trip-card__media {
  position: relative;
  height: 148px;
  overflow: hidden;
}

.trip-card__cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.trip-card__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgb(0 0 0 / 0%) 30%,
    rgb(0 0 0 / 28%) 100%
  );
  pointer-events: none;
}

.trip-card__dest {
  position: absolute;
  bottom: 12px;
  left: 14px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgb(255 255 255 / 92%);
  backdrop-filter: blur(6px);
  font-size: 12px;
  font-weight: 600;
  color: #1989fa;
}

.trip-card__tag {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgb(0 0 0 / 35%);
  backdrop-filter: blur(4px);
  font-size: 11px;
  color: #fff;
}

.trip-card__body {
  padding: 14px 16px 16px;
}

.trip-card__title {
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.4;
  color: #111;
}

.trip-card__meta {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 13px;
  color: #646566;
}

.meta-item {
  display: inline-flex;
  gap: 4px;
  align-items: center;
}

.meta-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #c8c9cc;
}
</style>
