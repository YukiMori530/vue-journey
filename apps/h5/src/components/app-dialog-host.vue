<script setup lang="ts">
import { computed } from 'vue'
import {
  dialogOptions,
  dialogVisible,
  resolveAppDialog,
  type AppDialogIcon,
} from '../utils/app-dialog'

const iconMap: Record<AppDialogIcon, string> = {
  location: '📍',
  confirm: '✦',
  info: '💬',
}

const iconText = computed(() => iconMap[dialogOptions.value.icon ?? 'info'])

function cancel() {
  resolveAppDialog(false)
}

function confirm() {
  resolveAppDialog(true)
}
</script>

<template>
  <van-overlay :show="dialogVisible" z-index="3000" class="app-dialog-overlay" @click="cancel">
    <div class="app-dialog" @click.stop>
      <div class="app-dialog__icon-wrap">
        <span class="app-dialog__icon">{{ iconText }}</span>
      </div>
      <h2 class="app-dialog__title">{{ dialogOptions.title }}</h2>
      <p class="app-dialog__message">{{ dialogOptions.message }}</p>
      <div class="app-dialog__actions">
        <button
          v-if="dialogOptions.showCancel !== false"
          type="button"
          class="app-dialog__btn app-dialog__btn--ghost"
          @click="cancel"
        >
          {{ dialogOptions.cancelText }}
        </button>
        <button type="button" class="app-dialog__btn app-dialog__btn--primary" @click="confirm">
          {{ dialogOptions.confirmText }}
        </button>
      </div>
    </div>
  </van-overlay>
</template>

<style scoped>
.app-dialog-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  backdrop-filter: blur(6px);
  background: rgb(0 0 0 / 36%);
}

.app-dialog {
  width: min(320px, 100%);
  padding: 28px 22px 20px;
  border-radius: 24px;
  background: linear-gradient(180deg, #fff 0%, #f8f9fc 100%);
  box-shadow: 0 20px 48px rgb(0 0 0 / 16%);
  animation: dialog-in 0.28s ease;
}

@keyframes dialog-in {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.96);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.app-dialog__icon-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 14px;
}

.app-dialog__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: linear-gradient(135deg, #dbeafe 0%, #ede9fe 100%);
  font-size: 26px;
  box-shadow: 0 8px 20px rgb(124 92 191 / 12%);
}

.app-dialog__title {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 800;
  text-align: center;
  color: #111;
}

.app-dialog__message {
  margin: 0 0 22px;
  font-size: 14px;
  line-height: 1.65;
  text-align: center;
  color: #646566;
}

.app-dialog__actions {
  display: flex;
  gap: 10px;
}

.app-dialog__btn {
  flex: 1;
  padding: 13px 0;
  border: none;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.app-dialog__btn--ghost {
  background: #eef0f3;
  color: #646566;
}

.app-dialog__btn--primary {
  background: linear-gradient(135deg, #111 0%, #333 100%);
  color: #fff;
  box-shadow: 0 6px 16px rgb(0 0 0 / 18%);
}
</style>
