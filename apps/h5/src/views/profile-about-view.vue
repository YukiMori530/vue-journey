<script setup lang="ts">
import { useRouter } from 'vue-router'
import ProfileNavBar from '../components/profile-nav-bar.vue'

const router = useRouter()

const milestones = [
  { month: '1月', title: '项目启动', desc: '途绘 H5 原型搭建' },
  { month: '3月', title: '核心功能', desc: '行程创建与 AI 规划' },
  { month: '5月', title: '采集识别', desc: '打卡与分组整理' },
  { month: '6月', title: '1.0 上线', desc: '个人中心与探索页' },
]

function goBack() {
  router.back()
}
</script>

<template>
  <div class="about-page">
    <ProfileNavBar title="关于途绘" @back="goBack" />

    <section class="hero">
      <h1 class="hero-title">让旅行发生<br />让旅途有爱</h1>
      <p class="hero-desc">
        途绘是一款面向旅行爱好者的 H5 应用，帮你记录足迹、规划行程、采集生活瞬间。
      </p>
    </section>

    <section class="story">
      <h2 class="story-title">产品初衷</h2>
      <p class="story-text">
        我们相信，旅行不只是到达某个地点，更是把路上的感受留下来。途绘希望用更轻的方式，
        帮你把碎片化的灵感和打卡，整理成属于自己的旅行故事。
      </p>

      <div class="photo-stack" aria-hidden="true">
        <img src="/covers/beijing.jpg" alt="" class="photo photo--1" />
        <img src="/covers/shanghai.jpg" alt="" class="photo photo--2" />
        <img src="/covers/chengdu.jpg" alt="" class="photo photo--3" />
      </div>
    </section>

    <section class="stamp-badge">
      <span class="stamp-badge__inner">途绘 1.0 上线啦</span>
    </section>

    <section class="timeline-section">
      <h2 class="timeline-title">打磨</h2>
      <div class="timeline">
        <div v-for="item in milestones" :key="item.month" class="timeline-item">
          <span class="timeline-month">{{ item.month }}</span>
          <div class="timeline-card">
            <p class="timeline-card__title">{{ item.title }}</p>
            <p class="timeline-card__desc">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-page {
  min-height: 100vh;
  background: #fff;
}

.hero {
  padding: 24px 20px 32px;
  background: linear-gradient(180deg, #dbeafe 0%, #fff 100%);
}

.hero-title {
  margin: 0 0 16px;
  font-size: 32px;
  font-weight: 800;
  line-height: 1.25;
  color: #111;
}

.hero-desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: #646566;
}

.story {
  padding: 32px 20px;
}

.story-title {
  margin: 0 0 12px;
  font-size: 22px;
  font-weight: 800;
  color: #111;
}

.story-text {
  margin: 0 0 24px;
  font-size: 14px;
  line-height: 1.8;
  color: #646566;
}

.photo-stack {
  position: relative;
  height: 180px;
}

.photo {
  position: absolute;
  width: 120px;
  height: 90px;
  border: 4px solid #fff;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 4px 16px rgb(0 0 0 / 12%);
}

.photo--1 {
  top: 20px;
  left: 10%;
  transform: rotate(-8deg);
}

.photo--2 {
  top: 0;
  left: 38%;
  transform: rotate(4deg);
  z-index: 1;
}

.photo--3 {
  top: 30px;
  right: 8%;
  transform: rotate(-3deg);
}

.stamp-badge {
  display: flex;
  justify-content: center;
  margin: -20px 0 0;
  padding: 0 20px;
  position: relative;
  z-index: 2;
}

.stamp-badge__inner {
  padding: 12px 24px;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 4px 20px rgb(0 0 0 / 10%);
  font-size: 14px;
  font-weight: 700;
  color: #ee0a24;
}

.timeline-section {
  padding: 40px 20px 48px;
  background: #111;
}

.timeline-title {
  margin: 0 0 24px;
  font-size: 22px;
  font-weight: 800;
  color: #fff;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.timeline-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.timeline-month {
  flex-shrink: 0;
  width: 36px;
  font-size: 13px;
  font-weight: 600;
  color: #969799;
}

.timeline-card {
  flex: 1;
  padding: 16px;
  border-radius: 16px;
  background: #1c1c1e;
}

.timeline-card__title {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}

.timeline-card__desc {
  margin: 0;
  font-size: 13px;
  color: #969799;
}
</style>
