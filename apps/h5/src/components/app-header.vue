<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function openSearch() {
  router.push('/search')
}

function openProfile() {
  if (!authStore.isLoggedIn) {
    router.push('/login')
    return
  }
  router.push('/profile')
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
      <button type="button" class="avatar-btn" aria-label="账户" @click="openProfile">
        <span v-if="authStore.isLoggedIn" class="avatar-text">
          {{ authStore.displayName.slice(0, 1) }}
        </span>
        <van-icon v-else name="user-o" size="20" />
      </button>
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

.icon-btn,
.avatar-btn {
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

.icon-btn:active,
.avatar-btn:active {
  background: #f2f3f5;
}

.avatar-btn {
  border: 2px solid #fff;
  background: #1989fa;
  color: #fff;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}

.avatar-text {
  font-size: 15px;
  font-weight: 700;
}
</style>
