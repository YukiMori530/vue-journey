<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import PlanGeneratingMap from '../components/plan-generating-map.vue'
import type { GeneratingMapStop } from '../utils/plan-generation-script'
import { useTripStore } from '../stores/trip'
import { ApiError } from '../api/client'
import type { PlanStreamLog } from '../api/ai'
import type { Trip, TripStop } from '../types/trip'
import { normalizeDayPlan } from '../types/trip'
import { parseTripPrompt } from '../utils/parse-trip-prompt'
import {
  GENERATING_STATUS,
  REVEAL_STATUS,
} from '../utils/plan-generation-script'
import { enrichStop } from '../utils/enrich-trip-stops'
import { geocodeCityCenter, resolveDayStops } from '../utils/trip-geocode'

interface RevealedItem {
  day: number
  dayTitle: string
  order: number
  stop: TripStop
}

const router = useRouter()
const route = useRoute()
const tripStore = useTripStore()

const parsed = computed(() => {
  const q = (route.query.q as string) ?? ''
  const days = route.query.days ? Number(route.query.days) : null
  return parseTripPrompt(q, days)
})

const visibleLogs = ref<PlanStreamLog[]>([])
const thinkingExpanded = ref(true)
const statusText = ref(GENERATING_STATUS)
const phase = ref<'thinking' | 'revealing' | 'done'>('thinking')
const revealedItems = ref<RevealedItem[]>([])
const tripResult = ref<Trip | null>(null)
const cancelled = ref(false)
const errorMessage = ref('')

let logTimer: ReturnType<typeof setTimeout> | null = null
let revealTimer: ReturnType<typeof setTimeout> | null = null

const logScroll = ref<HTMLElement | null>(null)
const previewScroll = ref<HTMLElement | null>(null)

function scrollPanelsToBottom() {
  nextTick(() => {
    for (const el of [logScroll.value, previewScroll.value]) {
      if (el) {
        el.scrollTop = el.scrollHeight
      }
    }
  })
}

watch(visibleLogs, scrollPanelsToBottom, { deep: true })
watch(revealedItems, scrollPanelsToBottom, { deep: true })

const mapCenter = ref<[number, number]>([105.0, 35.0])
const flatStops = ref<RevealedItem[]>([])

const mapStops = computed<GeneratingMapStop[]>(() =>
  revealedItems.value.map((item) => ({
    name: item.stop.name,
    lng: item.stop.lng!,
    lat: item.stop.lat!,
    order: item.order,
    day: item.day,
  })),
)

async function buildFlatStops(trip: Trip) {
  const items: RevealedItem[] = []

  for (let dayIndex = 0; dayIndex < trip.dayPlans.length; dayIndex += 1) {
    const dayPlan = trip.dayPlans[dayIndex]
    const normalized = normalizeDayPlan(dayPlan)
    const dayTitle = dayPlan.title ?? `DAY ${dayPlan.day} ${parsed.value.destination}深度游`
    const needsGeocode = normalized.places.some(
      (stop) => stop.lng == null || stop.lat == null,
    )
    const places = needsGeocode
      ? await resolveDayStops(normalized.places, trip.destination, dayIndex)
      : normalized.places

    places.forEach((stop, stopIndex) => {
      items.push({
        day: dayPlan.day,
        dayTitle,
        order: stopIndex + 1,
        stop: enrichStop(stop, stopIndex, trip.destination),
      })
    })
  }

  flatStops.value = items
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function clearTimers() {
  if (logTimer) {
    clearTimeout(logTimer)
    logTimer = null
  }
  if (revealTimer) {
    clearTimeout(revealTimer)
    revealTimer = null
  }
}

const logsComplete = ref(false)

function onAgentLog(log: PlanStreamLog) {
  visibleLogs.value.push(log)
  if (log.kind === 'summary') {
    statusText.value = REVEAL_STATUS
  }
}

function flushRemainingLogs() {
  logsComplete.value = true
  statusText.value = REVEAL_STATUS
}

function onTripReady() {
  tryStartReveal()
}

function tryStartReveal() {
  if (cancelled.value || phase.value !== 'thinking' || !tripResult.value || !logsComplete.value) {
    return
  }
  startReveal()
}

async function startReveal() {
  if (cancelled.value || phase.value !== 'thinking' || !tripResult.value) {
    return
  }

  phase.value = 'revealing'
  statusText.value = REVEAL_STATUS

  for (let i = 0; i < flatStops.value.length; i += 1) {
    if (cancelled.value) {
      return
    }
    await sleep(280)
    revealedItems.value.push(flatStops.value[i])
  }

  await sleep(400)
  if (!cancelled.value && tripResult.value) {
    phase.value = 'done'
    router.replace(`/trip/${tripResult.value.id}?day=1`)
  }
}

async function runGeneration() {
  const apiPromise = tripStore
    .addTrip(
      {
        destination: parsed.value.destination,
        days: parsed.value.days,
        preferences: parsed.value.preferences,
        rawQuery: parsed.value.raw,
      },
      onAgentLog,
    )
    .then(async (trip) => {
      tripResult.value = trip
      await buildFlatStops(trip)
      flushRemainingLogs()
      onTripReady()
      return trip
    })
    .catch((error: unknown) => {
      if (cancelled.value) {
        return null
      }
      errorMessage.value = error instanceof ApiError ? error.message : '规划失败，请确认后端已启动'
      showToast(errorMessage.value)
      return null
    })

  const trip = await apiPromise
  if (cancelled.value) {
    return
  }
  if (!trip && errorMessage.value) {
    await sleep(1200)
    router.replace('/create/plan?q=' + encodeURIComponent(parsed.value.raw))
  }
}

function cancelGeneration() {
  cancelled.value = true
  clearTimers()
  router.back()
}

onMounted(async () => {
  const center = await geocodeCityCenter(parsed.value.destination)
  if (center) {
    mapCenter.value = [center.lng, center.lat]
  }
  runGeneration()
})

onUnmounted(() => {
  clearTimers()
})
</script>

<template>
  <div class="gen-page">
    <header class="gen-header">
      <button type="button" class="back-btn" aria-label="返回" @click="cancelGeneration">
        <van-icon name="arrow-left" size="20" />
      </button>
    </header>

    <div class="gen-map-wrap">
      <PlanGeneratingMap
        :center="mapCenter"
        :stops="mapStops"
        :destination="parsed.destination"
      />
    </div>

    <section class="gen-sheet">
      <div class="gen-sheet__handle" />

      <div class="gen-bubble">{{ parsed.fullPrompt }}</div>

      <button type="button" class="gen-think-toggle" @click="thinkingExpanded = !thinkingExpanded">
        <span class="gen-think-toggle__dots">✦</span>
        <span>{{ phase === 'done' ? '深度思考完成' : '深度思考中…' }}（AI Agent）</span>
        <van-icon :name="thinkingExpanded ? 'arrow-up' : 'arrow-down'" size="14" color="#969799" />
      </button>

      <div v-show="thinkingExpanded" ref="logScroll" class="gen-logs">
        <p
          v-for="(log, index) in visibleLogs"
          :key="index"
          class="gen-log"
          :class="`gen-log--${log.kind}`"
        >
          <span v-if="log.kind === 'result'" class="gen-log__spark">✦</span>
          <span v-if="log.kind === 'check' && log.text.startsWith('✅')" class="gen-log__check">✅</span>
          {{ log.text }}
        </p>
      </div>

      <div v-if="revealedItems.length" ref="previewScroll" class="gen-preview">
        <template v-for="(item, index) in revealedItems" :key="`${item.day}-${item.order}-${index}`">
          <h3
            v-if="index === 0 || revealedItems[index - 1]?.day !== item.day"
            class="gen-preview__day"
          >
            {{ item.dayTitle }}
          </h3>
          <article class="gen-preview__card">
            <img
              v-if="item.stop.cover"
              class="gen-preview__cover"
              :src="item.stop.cover"
              :alt="item.stop.name"
            />
            <div v-else class="gen-preview__cover gen-preview__cover--placeholder">
              <van-icon name="photo-o" size="24" color="#c8c9cc" />
            </div>
            <div class="gen-preview__body">
              <h4>{{ item.order }}. {{ item.stop.name }}</h4>
              <p>{{ item.stop.description }}</p>
            </div>
          </article>
        </template>
      </div>

      <div class="gen-status">
        <span class="gen-status__dots" aria-hidden="true">
          <i /><i /><i />
        </span>
        <span>{{ statusText }}</span>
      </div>

      <button type="button" class="gen-cancel" @click="cancelGeneration">
        <span class="gen-cancel__icon" />
        取消
      </button>
    </section>
  </div>
</template>

<style scoped>
.gen-page {
  position: relative;
  height: 100vh;
  overflow: hidden;
  background: #eef2f6;
}

.gen-header {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;
  padding: 12px 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgb(255 255 255 / 92%);
  box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
  cursor: pointer;
}

.gen-map-wrap {
  position: absolute;
  inset: 0 0 42%;
}

.gen-sheet {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  max-height: 58vh;
  padding: 8px 16px calc(16px + env(safe-area-inset-bottom));
  border-radius: 24px 24px 0 0;
  background: #fff;
  box-shadow: 0 -8px 32px rgb(0 0 0 / 8%);
}

.gen-sheet__handle {
  width: 36px;
  height: 4px;
  margin: 0 auto 12px;
  border-radius: 999px;
  background: #dcdee0;
}

.gen-bubble {
  align-self: flex-start;
  max-width: 88%;
  margin-bottom: 14px;
  padding: 12px 14px;
  border-radius: 16px 16px 16px 4px;
  background: #dbeafe;
  font-size: 15px;
  line-height: 1.5;
  color: #111;
}

.gen-think-toggle {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 8px;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: #323233;
  cursor: pointer;
}

.gen-think-toggle__dots {
  font-size: 12px;
  color: #6366f1;
}

.gen-logs {
  flex: 0 1 auto;
  max-height: 120px;
  margin-bottom: 10px;
  overflow-y: auto;
}

.gen-log {
  margin: 0 0 8px;
  font-size: 13px;
  line-height: 1.55;
  color: #969799;
}

.gen-log--intro,
.gen-log--search,
.gen-log--location {
  color: #969799;
}

.gen-log--result {
  color: #646566;
}

.gen-log--check,
.gen-log--adjust,
.gen-log--summary {
  color: #323233;
}

.gen-log__spark {
  margin-right: 4px;
  color: #6366f1;
}

.gen-preview {
  flex: 1;
  min-height: 0;
  margin-bottom: 10px;
  overflow-y: auto;
}

.gen-preview__day {
  margin: 12px 0 8px;
  font-size: 14px;
  font-weight: 700;
  color: #111;
}

.gen-preview__card {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.gen-preview__cover {
  width: 64px;
  height: 64px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}

.gen-preview__cover--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f2f3f5;
}

.gen-preview__body h4 {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 700;
  color: #111;
}

.gen-preview__body p {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  font-size: 12px;
  line-height: 1.5;
  color: #646566;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.gen-status {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
  font-size: 13px;
  color: #646566;
}

.gen-status__dots {
  display: inline-flex;
  gap: 3px;
}

.gen-status__dots i {
  display: block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: gen-dot 1.2s infinite ease-in-out;
}

.gen-status__dots i:nth-child(1) {
  background: #fbbf24;
  animation-delay: 0s;
}

.gen-status__dots i:nth-child(2) {
  background: #f472b6;
  animation-delay: 0.15s;
}

.gen-status__dots i:nth-child(3) {
  background: #60a5fa;
  animation-delay: 0.3s;
}

@keyframes gen-dot {
  0%,
  80%,
  100% {
    transform: scale(0.75);
    opacity: 0.5;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.gen-cancel {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 200px;
  margin: 0 auto;
  padding: 12px 20px;
  border: none;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 2px 12px rgb(0 0 0 / 8%);
  font-size: 15px;
  font-weight: 600;
  color: #111;
  cursor: pointer;
}

.gen-cancel__icon {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: #111;
}
</style>
