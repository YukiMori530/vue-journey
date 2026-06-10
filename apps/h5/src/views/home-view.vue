<script setup lang="ts">
const features = [
  'AI 智能规划行程',
  '粘贴攻略一键整理',
  '查看与管理我的行程',
]
</script>

<template>
  <div class="page">
    <van-nav-bar title="Circle Journey" fixed placeholder />

    <div class="page-body">
      <p class="subtitle">你的 AI 旅行规划助手</p>

      <van-cell-group inset title="核心功能">
        <van-cell v-for="item in features" :key="item" :title="item" />
      </van-cell-group>
    </div>
  </div>
</template>

<style scoped>
.page-body {
  padding: 8px 0 24px;
}

.subtitle {
  margin: 0 0 16px;
  padding: 0 16px;
  font-size: 14px;
  color: #969799;
}
</style>
