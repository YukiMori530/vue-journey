<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { parseTripPrompt } from '../utils/parse-trip-prompt'

const router = useRouter()
const route = useRoute()

const parsed = computed(() => {
  const q = (route.query.q as string) ?? ''
  const days = route.query.days ? Number(route.query.days) : null
  return parseTripPrompt(q, days)
})

function goBack() {
  router.back()
}

function replaceInput() {
  router.push('/create')
}

async function startPlan() {
  router.push({
    path: '/create/generating',
    query: {
      q: parsed.value.raw,
      days: String(parsed.value.days),
    },
  })
}
</script>

<template>
  <div class="plan-page">
    <header class="plan-header">
      <button type="button" class="back-btn" aria-label="返回" @click="goBack">
        <van-icon name="arrow-left" size="20" />
      </button>
      <button type="button" class="plan-btn" @click="startPlan">
        智能规划
      </button>
    </header>

    <div class="plan-body">
      <h1 class="plan-heading">
        试试说你「想去哪、几天」<br />
        我来帮你智能规划
      </h1>

      <div class="plan-card">
        <div class="plan-card__top">
          <span class="plan-card__label">你的输入：{{ parsed.raw }}</span>
          <button type="button" class="replace-btn" @click="replaceInput">
            <van-icon name="replay" size="14" />
            替换
          </button>
        </div>
        <div class="plan-card__prompt">{{ parsed.fullPrompt }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.plan-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #dbeafe 0%, #eff6ff 45%, #f8fafc 100%);
}

.plan-header {
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

.plan-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 999px;
  background: #111;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
}

.plan-btn:disabled {
  opacity: 0.6;
}

.plan-body {
  padding: 24px 20px;
}

.plan-heading {
  margin: 0 0 32px;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.35;
  color: #111;
}

.plan-card {
  padding: 18px;
  border-radius: 20px;
  background: rgb(255 255 255 / 88%);
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 32px rgb(25 137 250 / 10%);
}

.plan-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.plan-card__label {
  font-size: 14px;
  font-weight: 600;
  color: #323233;
}

.replace-btn {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 6px 10px;
  border: none;
  border-radius: 999px;
  background: #f2f3f5;
  font-size: 12px;
  color: #646566;
  cursor: pointer;
}

.plan-card__prompt {
  padding: 20px 16px;
  border: 1px dashed #dcdee0;
  border-radius: 14px;
  background: #fff;
  font-size: 16px;
  line-height: 1.6;
  color: #111;
}
</style>
