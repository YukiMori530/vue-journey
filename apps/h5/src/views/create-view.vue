<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useTripStore } from '../stores/trip'
import { ApiError } from '../api/client'
import { searchPlaceSuggestions } from '../utils/place-suggestions'

const router = useRouter()
const tripStore = useTripStore()

const prompt = ref('')
const creatingEmpty = ref(false)

const showSuggestions = computed(() => prompt.value.trim().length > 0)
const placeSuggestions = computed(() => searchPlaceSuggestions(prompt.value))

function goBack() {
  router.back()
}

function clearPrompt() {
  prompt.value = ''
}

function openSmartPlan() {
  if (!prompt.value.trim()) {
    showToast('输入目的地或行程想法')
    return
  }
  router.push({
    path: '/create/plan',
    query: { q: prompt.value.trim() },
  })
}

function applyPlace(name: string) {
  prompt.value = `${name.replace(/市|县/, '')}三日游`
}

async function createEmptyPlan() {
  creatingEmpty.value = true
  try {
    const trip = await tripStore.addEmptyTrip()
    showToast('已创建空计划')
    router.push(`/trip/${trip.id}`)
  } catch (error) {
    const message = error instanceof ApiError ? error.message : '创建失败'
    showToast(message)
  } finally {
    creatingEmpty.value = false
  }
}
</script>

<template>
  <div class="create-page">
    <header class="create-header">
      <button type="button" class="back-btn" aria-label="返回" @click="goBack">
        <van-icon name="arrow-left" size="20" />
      </button>
    </header>

    <div class="create-body">
      <h1 class="create-heading">你想去哪里？</h1>

      <div class="search-wrap">
        <div class="ai-input-wrap">
          <span class="ai-input__icon" aria-hidden="true">
            <van-icon name="chat-o" size="20" color="#7C5CBF" />
          </span>
          <input
            v-model="prompt"
            type="text"
            class="ai-input"
            placeholder="输入目的地或告诉我你的想法"
            @keydown.enter="openSmartPlan"
          />
          <button v-if="prompt" type="button" class="clear-btn" aria-label="清除" @click="clearPrompt">
            <van-icon name="cross" size="16" color="#969799" />
          </button>
        </div>

        <div v-if="showSuggestions" class="suggest-panel">
          <button type="button" class="suggest-smart" @click="openSmartPlan">
            <div>
              <p class="suggest-smart__title">{{ prompt }}</p>
              <p class="suggest-smart__sub">点击体验智能规划</p>
            </div>
            <span class="suggest-smart__go">
              <van-icon name="arrow" size="16" color="#fff" />
            </span>
          </button>

          <button
            v-for="place in placeSuggestions"
            :key="place.name"
            type="button"
            class="suggest-place"
            @click="applyPlace(place.name)"
          >
            <div>
              <p class="suggest-place__name">{{ place.name }}</p>
              <p class="suggest-place__region">{{ place.region }}</p>
            </div>
            <van-icon name="plus" size="16" color="#969799" />
          </button>
        </div>
      </div>

      <div class="empty-plan-center">
        <p class="empty-plan-hint">还没想好去哪？可以先建一个空白计划慢慢填</p>
        <button
          type="button"
          class="empty-plan-btn"
          :disabled="creatingEmpty"
          @click="createEmptyPlan"
        >
          {{ creatingEmpty ? '创建中…' : '创建空计划' }}
        </button>
      </div>
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

.search-wrap {
  position: relative;
}

.ai-input-wrap {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 14px 16px;
  border: 2px solid rgb(124 92 191 / 18%);
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 0 0 4px rgb(124 92 191 / 6%);
}

.ai-input__icon {
  flex-shrink: 0;
}

.ai-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  color: #111;
  outline: none;
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: #f2f3f5;
  cursor: pointer;
}

.suggest-panel {
  margin-top: 8px;
  overflow: hidden;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 8px 24px rgb(0 0 0 / 8%);
}

.suggest-smart {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 16px;
  border: none;
  border-bottom: 1px solid #f2f3f5;
  background: #fff;
  text-align: left;
  cursor: pointer;
}

.suggest-smart__title {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 700;
  color: #111;
}

.suggest-smart__sub {
  margin: 0;
  font-size: 13px;
  color: #969799;
}

.suggest-smart__go {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #1989fa;
}

.suggest-place {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 16px;
  border: none;
  border-bottom: 1px solid #f2f3f5;
  background: #fff;
  text-align: left;
  cursor: pointer;
}

.suggest-place:last-child {
  border-bottom: none;
}

.suggest-place__name {
  margin: 0 0 2px;
  font-size: 15px;
  font-weight: 600;
  color: #111;
}

.suggest-place__region {
  margin: 0;
  font-size: 12px;
  color: #969799;
}

.empty-plan-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 42vh;
  padding: 32px 12px;
  text-align: center;
}

.empty-plan-hint {
  margin: 0 0 20px;
  max-width: 260px;
  font-size: 14px;
  line-height: 1.6;
  color: #969799;
}

.empty-plan-btn {
  min-width: 200px;
  padding: 14px 28px;
  border: none;
  border-radius: 999px;
  background: #111;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
}
</style>
