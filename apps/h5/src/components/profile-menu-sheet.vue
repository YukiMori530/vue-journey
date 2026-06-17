<script setup lang="ts">
import { useRouter } from 'vue-router'

const show = defineModel<boolean>('show', { default: false })

const router = useRouter()

const menuItems = [
  { icon: 'user-circle-o', label: '账号与安全', path: '/profile/account' },
  { icon: 'edit', label: '编辑资料', path: '/profile/edit' },
  { icon: 'delete-o', label: '行程回收站', path: '/profile/trash' },
  { icon: 'chat-o', label: '和开发者聊聊', path: '/profile/feedback' },
  { icon: 'info-o', label: '版本信息', path: '/profile/version' },
  { icon: 'question-o', label: '关于途绘', path: '/profile/about' },
]

function close() {
  show.value = false
}

function navigate(path: string) {
  close()
  router.push(path)
}
</script>

<template>
  <van-popup
    v-model:show="show"
    position="right"
    :style="{ width: '82%', height: '100%' }"
    class="profile-menu-popup"
  >
    <nav class="profile-menu">
      <button
        v-for="item in menuItems"
        :key="item.path"
        type="button"
        class="profile-menu__item"
        @click="navigate(item.path)"
      >
        <van-icon :name="item.icon" size="22" />
        <span>{{ item.label }}</span>
      </button>
    </nav>
  </van-popup>
</template>

<style scoped>
:global(.profile-menu-popup) {
  border-radius: 20px 0 0 20px;
}

.profile-menu {
  padding: calc(16px + env(safe-area-inset-top)) 0 env(safe-area-inset-bottom);
}

.profile-menu__item {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 20px 28px;
  border: none;
  border-bottom: 1px solid #f2f3f5;
  background: #fff;
  font-size: 16px;
  font-weight: 500;
  color: #111;
  text-align: left;
  cursor: pointer;
}

.profile-menu__item:active {
  background: #fafafa;
}
</style>
