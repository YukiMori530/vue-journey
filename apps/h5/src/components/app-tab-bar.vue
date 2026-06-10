<script setup lang="ts">
import { useRoute } from 'vue-router'

defineProps<{
  sheetOpen?: boolean
}>()

const emit = defineEmits<{
  openCreate: []
}>()

const route = useRoute()

function onAddClick() {
  emit('openCreate')
}
</script>

<template>
  <nav class="tab-bar" :class="{ compact: sheetOpen }">
    <router-link to="/" class="tab-item" :class="{ active: route.path === '/' }">
      <van-icon name="bag-o" size="22" />
      <span>行程</span>
    </router-link>

    <button
      v-if="!sheetOpen"
      type="button"
      class="tab-add"
      aria-label="新建"
      @click="onAddClick"
    >
      <van-icon name="plus" size="22" color="#fff" />
    </button>

    <router-link
      to="/explore"
      class="tab-item"
      :class="{ active: route.path === '/explore' }"
    >
      <van-icon name="location-o" size="22" />
      <span>探索</span>
    </router-link>
  </nav>
</template>

<style scoped>
.tab-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  max-width: 480px;
  height: 56px;
  padding: 0 32px calc(8px + env(safe-area-inset-bottom));
  margin: 0 auto;
  background: rgb(255 255 255 / 96%);
  backdrop-filter: blur(8px);
}

.tab-bar.compact {
  justify-content: space-around;
  padding: 0 48px calc(8px + env(safe-area-inset-bottom));
}

.tab-item {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  align-items: center;
  font-size: 11px;
  color: #969799;
  text-decoration: none;
}

.tab-bar.compact .tab-item {
  flex: 0 0 auto;
}

.tab-item.active {
  color: #323233;
  font-weight: 500;
}

.tab-add {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  margin-bottom: 6px;
  border: none;
  border-radius: 16px;
  background: #1a1a1a;
  box-shadow: 0 4px 12px rgb(0 0 0 / 18%);
  cursor: pointer;
}

.tab-add:active {
  transform: scale(0.96);
}
</style>
