<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function openSearch() {
  router.push('/search')
}
</script>

<template>
  <header class="app-header">
    <div class="brand">
      <img class="brand-logo" src="/app-logo.svg" alt="途绘" />
      <span class="brand-name">途绘</span>
    </div>

    <div class="header-actions">
      <button type="button" class="icon-btn" aria-label="搜索" @click="openSearch">
        <van-icon name="search" size="24" />
      </button>
      <img
        class="user-avatar"
        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80"
        alt="头像"
      />
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0 16px;
}

.brand {
  display: flex;
  gap: 10px;
  align-items: center;
}

.brand-logo {
  width: 38px;
  height: 38px;
  border-radius: 12px;
}

.brand-name {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0.3px;
  color: #111;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #111;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.icon-btn:active {
  background: #f2f3f5;
}

.user-avatar {
  width: 38px;
  height: 38px;
  border: 2px solid #fff;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}
</style>
