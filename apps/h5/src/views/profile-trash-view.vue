<script setup lang="ts">
import { useRouter } from 'vue-router'
import ProfileNavBar from '../components/profile-nav-bar.vue'

const router = useRouter()

function goBack() {
  router.back()
}
</script>

<template>
  <div class="trash-page">
    <ProfileNavBar title="行程回收站" @back="goBack" />

    <div class="empty-wrap">
      <svg class="empty-art" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          d="M30 90c20-30 50-40 70-35s40 25 50 45"
          stroke="#111"
          stroke-width="1.5"
          stroke-linecap="round"
        />
        <rect x="55" y="45" width="70" height="52" rx="4" stroke="#111" stroke-width="1.5" />
        <circle cx="75" cy="62" r="8" stroke="#111" stroke-width="1.5" />
        <path d="M65 82l15-12 12 10 18-20" stroke="#111" stroke-width="1.5" stroke-linecap="round" />
        <ellipse cx="130" cy="108" rx="18" ry="10" stroke="#111" stroke-width="1.5" />
        <text x="122" y="112" font-size="10" fill="#111" font-family="sans-serif">PI</text>
      </svg>
      <p class="empty-text">空空如也，回收站中没有行程哦</p>
    </div>
  </div>
</template>

<style scoped>
.trash-page {
  min-height: 100vh;
  background: #fff;
}

.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 60px);
  padding: 24px;
}

.empty-art {
  width: 200px;
  height: 160px;
  margin-bottom: 24px;
}

.empty-text {
  margin: 0;
  font-size: 14px;
  color: #646566;
  text-align: center;
}
</style>
