<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import { useAuthStore } from '../stores/auth'
import { useCollectStore } from '../stores/collect'

const router = useRouter()
const authStore = useAuthStore()
const collectStore = useCollectStore()

const recentCollects = computed(() => collectStore.items.slice(0, 3))

function goBack() {
  router.back()
}

function openCollect() {
  router.push('/collect')
}

function openCamera() {
  router.push('/collect/camera')
}

async function openMenu() {
  try {
    await showConfirmDialog({
      title: '退出登录',
      message: `确定退出 ${authStore.displayName} 吗？`,
    })
    authStore.logout()
    showToast('已退出登录')
    router.push('/login')
  } catch {
    // 用户取消
  }
}

function checkIn() {
  openCamera()
}
</script>

<template>
  <div class="profile-page">
    <header class="profile-header">
      <button type="button" class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="20" />
      </button>
      <button type="button" class="menu-btn" aria-label="菜单" @click="openMenu">
        <van-icon name="wap-nav" size="20" />
      </button>
    </header>

    <section class="profile-card profile-card--map">
      <div class="card-top">
        <div>
          <p class="card-label">我打卡的地点</p>
          <div class="user-row">
            <img class="avatar" src="/covers/default.jpg" alt="头像" />
            <div>
              <p class="nickname">{{ authStore.displayName }}</p>
              <p class="stats">
                <span>城市 {{ collectStore.cityCount }}</span>
                <span>采集 {{ collectStore.count }}</span>
              </p>
            </div>
          </div>
        </div>
        <div class="stamp">
          <p class="stamp-num">{{ collectStore.count }}</p>
          <p class="stamp-label">打卡</p>
        </div>
      </div>

      <div class="map-placeholder">
        <div class="map-dot map-dot--1" />
        <div class="map-dot map-dot--2" />
        <div class="map-dot map-dot--3" />
        <button type="button" class="checkin-btn" @click="checkIn">打卡新足迹</button>
      </div>
    </section>

    <section class="profile-card" @click="openCollect">
      <div class="section-row">
        <h2 class="section-title">我的采集 · {{ collectStore.count }}</h2>
        <van-icon name="arrow" size="16" color="#c8c9cc" />
      </div>
      <div class="collect-grid">
        <div v-for="item in recentCollects" :key="item.id" class="collect-item">
          <img :src="item.photo" :alt="item.locationName" />
        </div>
        <button type="button" class="collect-empty" aria-label="添加采集" @click.stop="openCamera">
          <van-icon name="photograph" size="22" color="#c8c9cc" />
        </button>
      </div>
    </section>

    <section class="profile-card profile-card--activity">
      <div>
        <h2 class="section-title">途绘活动</h2>
        <p class="activity-desc">换个方式感受旅行</p>
      </div>
      <div class="activity-cards" aria-hidden="true">
        <div class="activity-card activity-card--back">2026 年度盘点</div>
        <div class="activity-card activity-card--front">收藏</div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.profile-page {
  min-height: 100vh;
  padding: 0 16px 24px;
  background: #f5f6f7;
}

.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
}

.back-btn,
.menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
}

.profile-card {
  margin-bottom: 14px;
  padding: 18px 16px;
  border-radius: 20px;
  background: #fff;
}

.profile-card--map {
  background: linear-gradient(180deg, #dbeafe 0%, #eff6ff 100%);
}

.card-label {
  margin: 0 0 12px;
  font-size: 13px;
  color: #646566;
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.user-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  object-fit: cover;
}

.nickname {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 700;
  color: #111;
}

.stats {
  display: flex;
  gap: 12px;
  margin: 0;
  font-size: 13px;
  color: #646566;
}

.stamp {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border: 2px dashed #1989fa;
  border-radius: 50%;
  background: rgb(255 255 255 / 70%);
}

.stamp-num {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: #1989fa;
}

.stamp-label {
  margin: 0;
  font-size: 11px;
  color: #646566;
}

.map-placeholder {
  position: relative;
  height: 160px;
  margin-top: 16px;
  overflow: hidden;
  border-radius: 16px;
  background:
    radial-gradient(circle at 30% 40%, rgb(25 137 250 / 18%) 0, transparent 45%),
    radial-gradient(circle at 70% 60%, rgb(25 137 250 / 12%) 0, transparent 40%),
    #eef4fb;
}

.map-dot {
  position: absolute;
  width: 10px;
  height: 10px;
  border: 2px solid #fff;
  border-radius: 50%;
  background: #1989fa;
  box-shadow: 0 2px 6px rgb(25 137 250 / 35%);
}

.map-dot--1 {
  top: 38%;
  left: 28%;
}

.map-dot--2 {
  top: 52%;
  left: 58%;
}

.map-dot--3 {
  top: 30%;
  left: 72%;
}

.checkin-btn {
  position: absolute;
  right: 12px;
  bottom: 12px;
  padding: 10px 16px;
  border: none;
  border-radius: 999px;
  background: #111;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
}

.section-title {
  margin: 0 0 12px;
  font-size: 17px;
  font-weight: 700;
  color: #111;
}

.section-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-row .section-title {
  margin: 0;
}

.collect-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.collect-item,
.collect-empty {
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 12px;
}

.collect-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.collect-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #dcdee0;
  background: #fafafa;
  cursor: pointer;
}

.profile-card--activity {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.activity-desc {
  margin: 0;
  font-size: 13px;
  color: #646566;
}

.activity-cards {
  position: relative;
  width: 120px;
  height: 72px;
  flex-shrink: 0;
}

.activity-card {
  position: absolute;
  width: 88px;
  height: 56px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-card--back {
  top: 0;
  right: 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  transform: rotate(8deg);
}

.activity-card--front {
  bottom: 0;
  left: 0;
  background: linear-gradient(135deg, #4facfe, #1989fa);
  transform: rotate(-6deg);
}
</style>
