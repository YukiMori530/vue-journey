<script setup lang="ts">
const preferences = ['美食', '摄影', '自然风光', '人文历史']
</script>

<template>
  <div class="page">
    <van-nav-bar title="AI 规划" fixed placeholder />

    <div class="page-body">
      <van-cell-group inset title="快速开始">
        <van-field label="目的地" placeholder="例如：成都" />
        <van-field label="天数" type="digit" placeholder="例如：3" />
      </van-cell-group>

      <van-cell-group inset title="旅行偏好">
        <van-cell
          v-for="item in preferences"
          :key="item"
          :title="item"
          is-link
        />
      </van-cell-group>

      <div class="action">
        <van-button type="primary" block round disabled>
          生成行程（Day 4 接入）
        </van-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-body {
  padding: 8px 0 24px;
}

.action {
  padding: 24px 16px 0;
}
</style>
