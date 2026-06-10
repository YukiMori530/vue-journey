<script setup lang="ts">
const features = [
  'AI 智能规划行程',
  '粘贴攻略一键整理',
  '查看与管理我的行程',
]
</script>

<template>
  <div class="home">
    <header class="home-header">
      <h1 class="home-title">Circle Journey</h1>
      <p class="home-subtitle">你的 AI 旅行规划助手</p>
    </header>

    <ul class="feature-list">
      <li v-for="item in features" :key="item" class="feature-item">
        {{ item }}
      </li>
    </ul>

    <p class="home-tip">Day 2：Vue 项目已跑通，接下来会逐步加页面和功能</p>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  padding: 48px 24px 32px;
  background: linear-gradient(180deg, #eef5ff 0%, #f7f8fa 40%);
}

.home-header {
  margin-bottom: 32px;
}

.home-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
}

.home-subtitle {
  margin: 8px 0 0;
  font-size: 15px;
  color: #666;
}

.feature-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.feature-item {
  padding: 14px 16px;
  margin-bottom: 12px;
  background: #fff;
  border-radius: 12px;
  font-size: 15px;
  color: #333;
  box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
}

.home-tip {
  margin-top: 32px;
  font-size: 13px;
  color: #999;
  text-align: center;
}
</style>
