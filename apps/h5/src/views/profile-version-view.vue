<script setup lang="ts">
import { useRouter } from 'vue-router'
import ProfileNavBar from '../components/profile-nav-bar.vue'

const router = useRouter()
const appVersion = '1.0.0'

function goBack() {
  router.back()
}
</script>

<template>
  <div class="version-page">
    <ProfileNavBar title="版本信息" @back="goBack" />

    <div class="version-body">
      <div class="app-icon">途</div>
      <h2 class="app-name">途绘</h2>
      <p class="app-version">Version {{ appVersion }}</p>

      <div class="info-list">
        <div class="info-row">
          <span>构建版本</span>
          <span class="info-value">{{ appVersion }}</span>
        </div>
        <div class="info-row">
          <span>技术栈</span>
          <span class="info-value">Vue 3 + Vant</span>
        </div>
        <div class="info-row">
          <span>更新日期</span>
          <span class="info-value">2026-06</span>
        </div>
      </div>

      <p class="copyright">© 2026 途绘 · 面试作品演示</p>
    </div>
  </div>
</template>

<style scoped>
.version-page {
  min-height: 100vh;
  background: #fff;
}

.version-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
}

.app-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  margin-bottom: 16px;
  border-radius: 18px;
  background: #111;
  font-size: 32px;
  font-weight: 800;
  color: #fff;
}

.app-name {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 700;
  color: #111;
}

.app-version {
  margin: 0 0 40px;
  font-size: 14px;
  color: #969799;
}

.info-list {
  width: 100%;
  overflow: hidden;
  border-radius: 14px;
  background: #f7f8fa;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #eee;
  font-size: 15px;
  color: #323233;
}

.info-row:last-child {
  border-bottom: none;
}

.info-value {
  color: #969799;
}

.copyright {
  margin-top: 48px;
  font-size: 12px;
  color: #c8c9cc;
}
</style>
