<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Trip } from '../types/trip'
import type { ResolvedDayStops } from '../composables/use-resolved-trip-stops'
import { mockDestinationWeather } from '../utils/trip-weather'
import { useTripMetaStore } from '../stores/trip-meta'
import TripNoteSheet from './trip-note-sheet.vue'
import TripPackSheet from './trip-pack-sheet.vue'
import PlaceCoverImage from './place-cover-image.vue'
import { extractTripStopNames, primaryPlaceName, resolveTripCoverStop } from '../utils/place-photo'

import { formatStopDisplayName } from '../utils/display-stop-name'

const props = defineProps<{
  trip: Trip
  days: ResolvedDayStops[]
}>()

defineEmits<{
  'select-day': [day: number]
}>()

const router = useRouter()
const metaStore = useTripMetaStore()

const expanded = ref(false)
const showNote = ref(false)
const showPack = ref(false)

const weather = computed(() => mockDestinationWeather(props.trip.destination))
const packCount = computed(() => metaStore.getMeta(props.trip.id).packItems.length)
const packDone = computed(() => metaStore.packDoneCount(props.trip.id))
const notePreview = computed(() => metaStore.getMeta(props.trip.id).note.trim())
const galleryStops = computed(() => extractTripStopNames(props.trip, 4))
const coverStop = computed(() => {
  const meta = metaStore.getMeta(props.trip.id)
  return resolveTripCoverStop(props.trip, meta.coverStopName)
})

function isCoverStop(stopName: string) {
  return primaryPlaceName(stopName) === primaryPlaceName(coverStop.value.name)
}

function selectCover(stopName: string) {
  metaStore.setCoverStop(props.trip.id, stopName)
}

const visibleDays = computed(() =>
  expanded.value ? props.days : props.days.slice(0, 1),
)

function placeChain(stops: ResolvedDayStops['stops']) {
  return stops
    .map((stop) => formatStopDisplayName(stop.name, props.trip.destination))
    .join(' → ')
}

function openCollect() {
  router.push({ path: '/collect', query: { tripId: String(props.trip.id) } })
}
</script>

<template>
  <div class="overview-body">
    <section v-if="days.length" class="day-preview-list">
      <article
        v-for="day in visibleDays"
        :key="day.day"
        class="day-preview-card"
        @click="$emit('select-day', day.day)"
      >
        <div class="day-preview-card__head">
          <span class="day-preview-card__tag">DAY {{ day.day }}</span>
          <span class="day-preview-card__km">{{ day.totalKm }} km</span>
        </div>
        <h3 class="day-preview-card__title">{{ day.title }}</h3>
        <p class="day-preview-card__route">{{ placeChain(day.stops) }}</p>
      </article>

      <button
        v-if="days.length > 1"
        type="button"
        class="expand-btn"
        @click="expanded = !expanded"
      >
        {{ expanded ? '收起' : '展开全部' }}
        <van-icon :name="expanded ? 'arrow-up' : 'arrow-down'" size="14" />
      </button>
    </section>

    <section class="block-card">
      <div class="block-card__head">
        <h3>图片空间 · {{ galleryStops.length || 1 }}</h3>
      </div>
      <div class="photo-grid">
        <button type="button" class="photo-add" aria-label="添加图片">
          <van-icon name="plus" size="22" color="#969799" />
        </button>
        <button
          v-for="(stopName, index) in galleryStops"
          :key="`${stopName}-${index}`"
          type="button"
          class="photo-item"
          :class="{ 'photo-item--cover': isCoverStop(stopName) }"
          @click="selectCover(stopName)"
        >
          <PlaceCoverImage
            class="photo-item__img"
            :name="stopName"
            :destination="trip.destination"
          />
          <span v-if="isCoverStop(stopName)" class="photo-item__tag">封面</span>
        </button>
      </div>
    </section>

    <section class="block-card block-card--click" @click="openCollect">
      <div class="block-card__head">
        <h3>我的采集 · 0</h3>
        <van-icon name="arrow" size="14" color="#c8c9cc" />
      </div>
      <p class="block-card__hint">这里会自动收录本行程城市的采集</p>
      <button type="button" class="collect-btn" @click.stop="openCollect">开始采集</button>
    </section>

    <section class="block-card">
      <div class="block-card__head">
        <h3>{{ trip.destination.replace(/(市|县|区)$/, '') || trip.destination }}</h3>
        <van-icon name="location-o" size="16" color="#969799" />
      </div>
      <div class="weather-row">
        <div v-for="item in weather" :key="item.label" class="weather-chip">
          <span class="weather-chip__label">{{ item.label }}</span>
          <span class="weather-chip__desc">{{ item.desc }}</span>
          <span class="weather-chip__temp">{{ item.low }}° - {{ item.high }}°</span>
        </div>
      </div>
    </section>

    <div class="feature-grid">
      <button type="button" class="feature-card feature-card--note" @click="showNote = true">
        <h3>便签</h3>
        <p>{{ notePreview || '记录你的旅行想法' }}</p>
      </button>
      <button type="button" class="feature-card feature-card--pack" @click="showPack = true">
        <h3>行李清单 · {{ packDone }}/{{ packCount }}</h3>
        <p>快捷添加出行物品</p>
      </button>
    </div>

    <TripNoteSheet v-model:show="showNote" :trip-id="trip.id" />
    <TripPackSheet v-model:show="showPack" :trip-id="trip.id" />
  </div>
</template>

<style scoped>
.overview-body {
  padding-bottom: 8px;
}

.day-preview-list {
  margin-bottom: 16px;
}

.day-preview-card {
  margin-bottom: 10px;
  padding: 14px 16px;
  border-radius: 16px;
  background: #f7f8fa;
  cursor: pointer;
}

.day-preview-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.day-preview-card__tag {
  font-size: 12px;
  font-weight: 700;
  color: #1989fa;
}

.day-preview-card__km {
  font-size: 12px;
  color: #969799;
}

.day-preview-card__title {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 700;
  color: #111;
}

.day-preview-card__route {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: #646566;
}

.expand-btn {
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 10px;
  border: none;
  background: transparent;
  font-size: 13px;
  color: #646566;
  cursor: pointer;
}

.block-card {
  margin-bottom: 14px;
  padding: 14px 16px;
  border-radius: 16px;
  background: #f7f8fa;
}

.block-card--click {
  cursor: pointer;
}

.block-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.block-card__head h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #111;
}

.block-card__hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: #969799;
}

.photo-grid {
  display: flex;
  gap: 10px;
}

.photo-add,
.photo-item {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  overflow: hidden;
}

.photo-add {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #dcdee0;
  background: #fff;
  cursor: pointer;
}

.photo-item {
  position: relative;
  padding: 0;
  border: 2px solid transparent;
  background: transparent;
  cursor: pointer;
}

.photo-item--cover {
  border-color: #7c5cbf;
}

.photo-item__img {
  width: 100%;
  height: 100%;
}

.photo-item__tag {
  position: absolute;
  top: 6px;
  left: 6px;
  padding: 2px 6px;
  border-radius: 6px;
  background: rgb(0 0 0 / 55%);
  font-size: 10px;
  color: #fff;
}

.collect-btn {
  padding: 10px 18px;
  border: none;
  border-radius: 999px;
  background: #111;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
}

.weather-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.weather-chip {
  padding: 10px;
  border-radius: 12px;
  background: #111;
  color: #fff;
}

.weather-chip__label,
.weather-chip__desc {
  display: block;
  font-size: 11px;
  opacity: 0.85;
}

.weather-chip__temp {
  display: block;
  margin-top: 4px;
  font-size: 13px;
  font-weight: 700;
}

.feature-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.feature-card {
  min-height: 96px;
  padding: 16px;
  border: none;
  border-radius: 16px;
  text-align: left;
  cursor: pointer;
}

.feature-card h3 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 700;
}

.feature-card p {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  font-size: 12px;
  line-height: 1.5;
  color: #646566;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.feature-card--note {
  background: #fff9e6;
}

.feature-card--pack {
  background: #e8f2fc;
}
</style>
