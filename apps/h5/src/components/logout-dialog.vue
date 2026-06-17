<script setup lang="ts">
const show = defineModel<boolean>('show', { default: false })

defineProps<{
  username: string
}>()

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
  <van-overlay :show="show" z-index="2000" @click="cancel">
    <div class="logout-dialog" @click.stop>
      <h2 class="logout-dialog__title">退出登录</h2>
      <p class="logout-dialog__msg">确定退出 {{ username }} 吗？</p>
      <div class="logout-dialog__actions">
        <button type="button" class="logout-dialog__btn logout-dialog__btn--ghost" @click="cancel">
          取消
        </button>
        <button type="button" class="logout-dialog__btn logout-dialog__btn--primary" @click="confirm">
          确认
        </button>
      </div>
    </div>
  </van-overlay>
</template>

<style scoped>
.logout-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  width: min(300px, calc(100vw - 48px));
  padding: 28px 24px 20px;
  border-radius: 20px;
  background: #fff;
  transform: translate(-50%, -50%);
}

.logout-dialog__title {
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  color: #111;
}

.logout-dialog__msg {
  margin: 0 0 24px;
  font-size: 14px;
  line-height: 1.6;
  text-align: center;
  color: #646566;
}

.logout-dialog__actions {
  display: flex;
  gap: 12px;
}

.logout-dialog__btn {
  flex: 1;
  padding: 13px 0;
  border: none;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.logout-dialog__btn--ghost {
  background: #f2f3f5;
  color: #646566;
}

.logout-dialog__btn--primary {
  background: #111;
  color: #fff;
}
</style>
