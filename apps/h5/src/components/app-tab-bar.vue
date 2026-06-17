<script setup lang="ts">
import { useRoute } from 'vue-router'

defineProps<{
  sheetOpen?: boolean
}>()

const emit = defineEmits<{
  openCreate: []
}>()

const route = useRoute()

const isTripActive = () => route.path === '/'
const isExploreActive = () => route.path === '/explore'

function onAddClick() {
  emit('openCreate')
}
</script>

<template>
  <nav class="tab-bar">
    <div class="tab-bar__inner" :class="{ compact: sheetOpen }">
      <router-link to="/" class="tab-item" :class="{ active: isTripActive() }">
        <van-icon :name="isTripActive() ? 'bag' : 'bag-o'" class="tab-item__icon" />
        <span class="tab-item__label">行程</span>
      </router-link>

      <button
        v-if="!sheetOpen"
        type="button"
        class="tab-add"
        aria-label="新建"
        @click="onAddClick"
      >
        <span class="tab-add__plus">+</span>
      </button>

      <router-link
        to="/explore"
        class="tab-item"
        :class="{ active: isExploreActive() }"
      >
        <van-icon :name="isExploreActive() ? 'location' : 'location-o'" class="tab-item__icon" />
        <span class="tab-item__label">探索</span>
      </router-link>
    </div>
  </nav>
</template>

<style scoped>
.tab-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 100;
  max-width: 480px;
  margin: 0 auto;
  padding: 8px 0 calc(10px + env(safe-area-inset-bottom));
  background: rgb(255 255 255 / 92%);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgb(0 0 0 / 4%);
}

.tab-bar__inner {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 32px;
}

.tab-bar__inner.compact {
  grid-template-columns: 1fr 1fr;
  padding: 0 56px;
}

.tab-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: center;
  justify-self: center;
  padding: 2px 8px;
  color: #b8b9be;
  text-decoration: none;
  transition: color 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.tab-item.active {
  color: #1989fa;
}

.tab-item__icon {
  font-size: 30px;
  line-height: 1;
}

.tab-item :deep(.van-icon) {
  color: currentcolor;
}

.tab-item__label {
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.2px;
}

.tab-add {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #4facfe 0%, #1989fa 55%, #0d6efd 100%);
  box-shadow: 0 8px 20px rgb(25 137 250 / 32%);
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}

.tab-add:active {
  transform: scale(0.92);
  opacity: 0.88;
}

.tab-add__plus {
  margin-top: -1px;
  font-size: 26px;
  font-weight: 200;
  line-height: 1;
  color: #fff;
}
</style>
