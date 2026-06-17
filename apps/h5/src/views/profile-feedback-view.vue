<script setup lang="ts">
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import ProfileNavBar from '../components/profile-nav-bar.vue'

const router = useRouter()

function goBack() {
  router.back()
}

function openFeedback() {
  showToast('感谢你的反馈，我们会认真阅读')
}
</script>

<template>
  <div class="feedback-page">
    <ProfileNavBar title="" @back="goBack" />

    <div class="feedback-body">
      <h1 class="feedback-title">和我们聊聊</h1>

      <svg class="feedback-art" viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="30" y="60" width="50" height="70" rx="6" stroke="#111" stroke-width="1.5" />
        <path d="M55 130v20l-12-10h-13" stroke="#111" stroke-width="1.5" stroke-linejoin="round" />
        <path d="M80 95h80" stroke="#111" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="4 4" />
        <path
          d="M160 95c20-5 35-15 45-30 5-8 8-18 8-28"
          stroke="#111"
          stroke-width="1.5"
          stroke-linecap="round"
        />
        <path
          d="M213 37c8 12 10 26 5 40-5 14-16 26-30 32"
          stroke="#111"
          stroke-width="1.5"
          stroke-linecap="round"
        />
        <ellipse cx="200" cy="50" rx="22" ry="30" stroke="#111" stroke-width="1.5" />
        <path d="M188 55c8 2 16 2 24 0" stroke="#111" stroke-width="1.5" stroke-linecap="round" />
      </svg>

      <p class="feedback-desc">请不要犹豫，与我们分享你的想法和意见！</p>

      <button type="button" class="feedback-btn" @click="openFeedback">去反馈</button>
    </div>
  </div>
</template>

<style scoped>
.feedback-page {
  min-height: 100vh;
  background: #fff;
}

.feedback-body {
  padding: 8px 24px 48px;
}

.feedback-title {
  margin: 0 0 48px;
  font-size: 28px;
  font-weight: 800;
  color: #111;
}

.feedback-art {
  display: block;
  width: 240px;
  height: 180px;
  margin: 0 auto 40px;
}

.feedback-desc {
  margin: 0 0 48px;
  font-size: 15px;
  line-height: 1.7;
  text-align: center;
  color: #323233;
}

.feedback-btn {
  display: block;
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
</style>
