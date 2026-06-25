<script setup lang="ts">
import { toastKind, toastMessage, toastVisible } from '../utils/app-toast'
</script>

<template>
  <Transition name="app-toast-fade">
    <div v-if="toastVisible" class="app-toast-host" role="status" aria-live="polite">
      <van-icon
        v-if="toastKind === 'success'"
        name="success"
        class="app-toast-host__icon app-toast-host__icon--success"
      />
      <van-icon
        v-else-if="toastKind === 'fail'"
        name="cross"
        class="app-toast-host__icon app-toast-host__icon--fail"
      />
      <van-icon
        v-else-if="toastKind === 'info'"
        name="info-o"
        class="app-toast-host__icon app-toast-host__icon--info"
      />
      <van-loading
        v-else-if="toastKind === 'loading'"
        size="18"
        color="#7c5cbf"
        class="app-toast-host__loading"
      />
      <span class="app-toast-host__text">{{ toastMessage }}</span>
    </div>
  </Transition>
</template>

<style scoped>
.app-toast-host {
  position: fixed;
  left: 50%;
  top: 50%;
  z-index: 3000;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: min(300px, calc(100vw - 48px));
  padding: 12px 18px;
  border-radius: 12px;
  background: rgb(255 255 255 / 96%);
  box-shadow: 0 8px 24px rgb(15 23 42 / 12%);
  color: #323233;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.45;
  pointer-events: none;
  user-select: none;
  transform: translate(-50%, -50%);
}

.app-toast-host__icon {
  flex-shrink: 0;
  font-size: 18px;
}

.app-toast-host__icon--success {
  color: #07c160;
}

.app-toast-host__icon--fail {
  color: #ee0a24;
}

.app-toast-host__icon--info {
  color: #1989fa;
}

.app-toast-host__loading {
  flex-shrink: 0;
}

.app-toast-host__text {
  text-align: center;
  word-break: break-word;
}

.app-toast-fade-enter-active,
.app-toast-fade-leave-active {
  transition: opacity 0.18s ease;
}

.app-toast-fade-enter-from,
.app-toast-fade-leave-to {
  opacity: 0;
}
</style>
