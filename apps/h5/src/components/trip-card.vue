<script setup lang="ts">
import { computed } from 'vue'
import type { Trip } from '../types/trip'
import { useAuthStore } from '../stores/auth'
import { useProfileStore } from '../stores/profile'
import PlaceCoverImage from './place-cover-image.vue'
import { getTripHeroStop } from '../utils/place-photo'
import { resolveTripCardBg } from '../utils/trip-themes'

const props = defineProps<{
  trip: Trip
}>()

const emit = defineEmits<{
  click: []
}>()

const authStore = useAuthStore()
const profileStore = useProfileStore()

const cardBg = computed(() => resolveTripCardBg(props.trip.theme, props.trip.id))
const heroStop = computed(() => getTripHeroStop(props.trip))
const showCover = computed(() => props.trip.placeCount > 0)
const dateLabel = computed(() => props.trip.nights || '未设置日期')
</script>

<template>
  <article class="trip-card" :style="{ background: cardBg }" @click="emit('click')">
    <div class="trip-card__content">
      <h3 class="trip-card__title">{{ trip.title }}</h3>
      <p class="trip-card__meta">{{ dateLabel }}</p>
      <p class="trip-card__meta">{{ trip.placeCount }} 个地点</p>
    </div>

    <img
      class="trip-card__avatar"
      :src="profileStore.avatarUrl"
      :alt="authStore.displayName"
    />

    <div v-if="showCover" class="trip-card__cover-wrap">
      <PlaceCoverImage
        class="trip-card__cover"
        :name="heroStop.name"
        :destination="heroStop.destination"
      />
    </div>
    <div v-else class="trip-card__cover-placeholder" aria-hidden="true">
      <van-icon name="photo-o" size="28" color="#c8c9cc" />
    </div>
  </article>
</template>

<style scoped>
.trip-card {
  position: relative;
  min-height: 148px;
  padding: 20px 18px;
  border-radius: 22px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.trip-card:active {
  transform: scale(0.985);
}

.trip-card__content {
  position: relative;
  z-index: 1;
  max-width: 62%;
}

.trip-card__title {
  margin: 0 0 10px;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.3;
  color: #111;
}

.trip-card__meta {
  margin: 0 0 4px;
  font-size: 13px;
  color: rgb(0 0 0 / 55%);
}

.trip-card__avatar {
  position: absolute;
  bottom: 18px;
  left: 18px;
  z-index: 2;
  width: 32px;
  height: 32px;
  border: 2px solid rgb(255 255 255 / 80%);
  border-radius: 50%;
  object-fit: cover;
}

.trip-card__cover-wrap {
  position: absolute;
  right: 12px;
  bottom: -8px;
  z-index: 1;
  width: 108px;
  height: 88px;
  transform: rotate(8deg);
}

.trip-card__cover {
  border: 3px solid #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgb(0 0 0 / 12%);
}

.trip-card__cover-placeholder {
  position: absolute;
  right: 18px;
  bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border: 2px solid rgb(255 255 255 / 70%);
  border-radius: 14px;
  background: rgb(255 255 255 / 45%);
  transform: rotate(6deg);
}
</style>
