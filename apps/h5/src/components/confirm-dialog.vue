<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    variant?: 'default' | 'danger'
  }>(),
  {
    confirmText: '确认',
    cancelText: '取消',
    variant: 'default',
  },
)

const show = defineModel<boolean>('show', { default: false })

const emit = defineEmits<{
  confirm: []
}>()

function cancel() {
  show.value = false
}

function confirm() {
  emit('confirm')
  show.value = false
}
</script>

<template>
  <van-overlay :show="show" z-index="2000" class="confirm-overlay" @click="cancel">
    <div class="confirm-dialog" @click.stop>
      <h2 class="confirm-dialog__title">{{ title }}</h2>
      <p class="confirm-dialog__msg">{{ message }}</p>
      <div class="confirm-dialog__actions">
        <button type="button" class="confirm-dialog__btn confirm-dialog__btn--ghost" @click="cancel">
          {{ cancelText }}
        </button>
        <button
          type="button"
          class="confirm-dialog__btn"
          :class="variant === 'danger' ? 'confirm-dialog__btn--danger' : 'confirm-dialog__btn--primary'"
          @click="confirm"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </van-overlay>
</template>

<style scoped>
.confirm-overlay {
  backdrop-filter: blur(4px);
}

.confirm-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  width: min(300px, calc(100vw - 48px));
  padding: 28px 24px 20px;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 12px 40px rgb(0 0 0 / 14%);
  transform: translate(-50%, -50%);
}

.confirm-dialog__title {
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  color: #111;
}

.confirm-dialog__msg {
  margin: 0 0 24px;
  font-size: 14px;
  line-height: 1.6;
  text-align: center;
  color: #646566;
}

.confirm-dialog__actions {
  display: flex;
  gap: 12px;
}

.confirm-dialog__btn {
  flex: 1;
  padding: 13px 0;
  border: none;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.confirm-dialog__btn--ghost {
  background: #f2f3f5;
  color: #646566;
}

.confirm-dialog__btn--primary {
  background: #111;
  color: #fff;
}

.confirm-dialog__btn--danger {
  background: #ee0a24;
  color: #fff;
}
</style>
