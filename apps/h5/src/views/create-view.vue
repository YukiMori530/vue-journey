<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useTripStore } from '../stores/trip'
import { ApiError } from '../api/client'

const router = useRouter()
const tripStore = useTripStore()

const prompt = ref('')
const selectedDays = ref<number | null>(null)
const submitting = ref(false)
const creatingEmpty = ref(false)

const quickCities = ['成都', '烟台', '北京', '上海', '海南']
const quickIdeas = [
  { label: '周末两日游', text: '周末两日游，轻松周边' },
  { label: '三天看海', text: '烟台三天两晚，想看海吃海鲜' },
  { label: '美食之旅', text: '成都3天，以美食和市井为主' },
  { label: '城市漫步', text: '上海2天，咖啡、展览、街拍' },
]

const preferenceOptions = ['美食', '摄影', '自然风光', '人文历史', '亲子', '慢节奏']
const selectedPrefs = ref<string[]>([])

const canSubmit = computed(() => prompt.value.trim().length > 0)

function parsePrompt(text: string) {
  const trimmed = text.trim()
  const daysMatch = trimmed.match(/(\d+)\s*天/)
  const cityMatch = trimmed.match(
    /(成都|烟台|北京|上海|海南|杭州|西安|重庆|厦门|大理|丽江|青岛|苏州|南京|广州|深圳|武汉|长沙)/,
  )

  let destination = cityMatch?.[1] ?? trimmed.split(/[，,。！!？?\s]/)[0] ?? trimmed
  destination = destination.slice(0, 20)

  const days = selectedDays.value ?? (daysMatch ? Number(daysMatch[1]) : 3)

  return { destination, days }
}

function togglePref(item: string) {
  const index = selectedPrefs.value.indexOf(item)
  if (index >= 0) {
    selectedPrefs.value.splice(index, 1)
  } else {
    selectedPrefs.value.push(item)
  }
}

function applyQuickCity(city: string) {
  prompt.value = `想去${city}玩`
}

function applyQuickIdea(idea: { text: string }) {
  prompt.value = idea.text
}

async function handleSubmit() {
  if (!canSubmit.value) {
    showToast('输入目的地或想法')
    return
  }

  const { destination, days } = parsePrompt(prompt.value)

  submitting.value = true
  try {
    const trip = await tripStore.addTrip({
      destination,
      days,
      preferences: [...selectedPrefs.value],
    })
    showToast('AI 行程已生成')
    router.push(`/trip/${trip.id}`)
  } catch (error) {
    const message = error instanceof ApiError ? error.message : '创建失败，请确认后端已启动'
    showToast(message)
  } finally {
    submitting.value = false
  }
}

async function createEmptyPlan() {
  creatingEmpty.value = true
  try {
    const trip = await tripStore.addEmptyTrip()
    showToast('已创建空计划')
    router.push(`/trip/${trip.id}`)
  } catch (error) {
    const message = error instanceof ApiError ? error.message : '创建失败，请确认后端已启动'
    showToast(message)
  } finally {
    creatingEmpty.value = false
  }
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="create-page">
    <header class="create-header">
      <button type="button" class="back-btn" aria-label="返回" @click="goBack">
        <van-icon name="arrow-left" size="20" />
      </button>
      <button
        type="button"
        class="empty-plan-btn"
        :disabled="creatingEmpty"
        @click="createEmptyPlan"
      >
        {{ creatingEmpty ? '创建中…' : '创建空计划' }}
      </button>
    </header>

    <div class="create-body">
      <h1 class="create-heading">你想去哪里？</h1>

      <div class="ai-input-wrap">
        <span class="ai-input__icon" aria-hidden="true">
          <van-icon name="chat-o" size="20" color="#7C5CBF" />
        </span>
        <textarea
          v-model="prompt"
          class="ai-input"
          rows="3"
          placeholder="输入目的地或告诉我你的想法"
          @keydown.enter.exact.prevent="handleSubmit"
        />
      </div>

      <div class="quick-section">
        <p class="quick-label">热门目的地</p>
        <div class="quick-chips">
          <button
            v-for="city in quickCities"
            :key="city"
            type="button"
            class="quick-chip"
            @click="applyQuickCity(city)"
          >
            {{ city }}
          </button>
        </div>
      </div>

      <div class="quick-section">
        <p class="quick-label">灵感推荐</p>
        <div class="idea-list">
          <button
            v-for="idea in quickIdeas"
            :key="idea.label"
            type="button"
            class="idea-card"
            @click="applyQuickIdea(idea)"
          >
            {{ idea.label }}
          </button>
        </div>
      </div>

      <div class="days-row">
        <span class="quick-label">行程天数</span>
        <div class="days-chips">
          <button
            v-for="day in [2, 3, 5, 7]"
            :key="day"
            type="button"
            class="day-chip"
            :class="{ active: selectedDays === day }"
            @click="selectedDays = selectedDays === day ? null : day"
          >
            {{ day }} 天
          </button>
        </div>
      </div>

      <div class="pref-section">
        <p class="quick-label">旅行偏好</p>
        <div class="pref-tags">
          <button
            v-for="item in preferenceOptions"
            :key="item"
            type="button"
            class="pref-tag"
            :class="{ active: selectedPrefs.includes(item) }"
            @click="togglePref(item)"
          >
            {{ item }}
          </button>
        </div>
      </div>

      <button
        type="button"
        class="submit-btn"
        :class="{ disabled: !canSubmit }"
        :disabled="submitting || !canSubmit"
        @click="handleSubmit"
      >
        <van-icon name="fire-o" size="18" />
        {{ submitting ? 'AI 规划中…' : 'AI 智能生成行程' }}
      </button>

      <p class="create-tip">由 DeepSeek 智能规划；未配置 API Key 时使用本地 mock</p>
    </div>
  </div>
</template>

<style scoped>
.create-page {
  min-height: 100vh;
  background: #fafafa;
}

.create-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.empty-plan-btn {
  padding: 10px 18px;
  border: none;
  border-radius: 999px;
  background: #111;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
}

.empty-plan-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.create-body {
  padding: 8px 20px 32px;
}

.create-heading {
  margin: 0 0 24px;
  font-size: 32px;
  font-weight: 800;
  line-height: 1.2;
  color: #111;
}

.ai-input-wrap {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 28px;
  padding: 16px 18px;
  border: 2px solid rgb(124 92 191 / 18%);
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 0 0 4px rgb(124 92 191 / 6%);
}

.ai-input__icon {
  flex-shrink: 0;
  padding-top: 2px;
}

.ai-input {
  flex: 1;
  min-height: 72px;
  border: none;
  background: transparent;
  font-size: 16px;
  line-height: 1.6;
  color: #111;
  resize: none;
  outline: none;
}

.ai-input::placeholder {
  color: #c8c9cc;
}

.quick-section {
  margin-bottom: 22px;
}

.quick-label {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 600;
  color: #969799;
}

.quick-chips,
.days-chips,
.pref-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.quick-chip,
.day-chip,
.pref-tag {
  padding: 8px 16px;
  border: 1px solid #ebedf0;
  border-radius: 999px;
  background: #fff;
  font-size: 14px;
  color: #323233;
  cursor: pointer;
}

.quick-chip:active,
.idea-card:active {
  background: #f2f3f5;
}

.idea-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.idea-card {
  padding: 14px 16px;
  border: none;
  border-radius: 14px;
  background: #fff;
  font-size: 14px;
  font-weight: 500;
  color: #323233;
  text-align: left;
  box-shadow: 0 2px 8px rgb(0 0 0 / 4%);
  cursor: pointer;
}

.days-row {
  margin-bottom: 22px;
}

.day-chip.active,
.pref-tag.active {
  border-color: #111;
  background: #111;
  color: #fff;
}

.pref-section {
  margin-bottom: 28px;
}

.submit-btn {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 999px;
  background: #111;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
}

.submit-btn.disabled,
.submit-btn:disabled {
  background: #dcdee0;
  cursor: not-allowed;
}

.create-tip {
  margin: 16px 0 0;
  font-size: 12px;
  text-align: center;
  color: #969799;
}
</style>
