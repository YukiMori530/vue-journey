<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app-layout">
    <RouterView />

    <van-tabbar route safe-area-inset-bottom>
      <van-tabbar-item replace to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item replace to="/plan" icon="guide-o">规划</van-tabbar-item>
      <van-tabbar-item replace to="/mine" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  padding-bottom: 50px;
  background: #f7f8fa;
}
</style>
