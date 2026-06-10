<script setup lang="ts">
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const show = defineModel<boolean>('show', { default: false })
const router = useRouter()

function close() {
  show.value = false
}

function goCreatePlan() {
  close()
  router.push('/create')
}

function goSmartImport() {
  close()
  router.push('/import')
}

function goCollect() {
  close()
  showToast('采集识别功能开发中')
}
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="action-sheet">
      <div class="action-sheet__mask" @click="close" />

      <div class="action-sheet__panel">
        <button type="button" class="action-item action-item--primary" @click="goCreatePlan">
          <span class="action-item__title">创建新的计划</span>
          <span class="action-item__icon action-item__icon--light">
            <van-icon name="plus" size="18" />
          </span>
        </button>

        <button type="button" class="action-item" @click="goSmartImport">
          <div class="action-item__text">
            <span class="action-item__title">智能导入地点/行程</span>
            <span class="action-item__desc">
              粘贴笔记链接、行程文本，或上传图片进行识别
            </span>
          </div>
          <span class="action-item__icon">
            <van-icon name="link-o" size="20" />
          </span>
        </button>

        <button type="button" class="action-item" @click="goCollect">
          <div class="action-item__text">
            <span class="action-item__title">采集识别</span>
            <span class="action-item__desc">识别同时收藏你的生活</span>
          </div>
          <span class="action-item__icon">
            <van-icon name="photograph" size="20" />
          </span>
        </button>
      </div>

      <button type="button" class="action-sheet__close" aria-label="关闭" @click="close">
        <van-icon name="cross" size="22" color="#fff" />
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.action-sheet {
  position: fixed;
  inset: 0;
  z-index: 200;
  max-width: 480px;
  margin: 0 auto;
}

.action-sheet__mask {
  position: absolute;
  inset: 0;
  background: rgb(0 0 0 / 45%);
}

.action-sheet__panel {
  position: absolute;
  right: 16px;
  bottom: calc(120px + env(safe-area-inset-bottom));
  left: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-item {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 18px 20px;
  border: none;
  border-radius: 16px;
  background: #fff;
  text-align: left;
  cursor: pointer;
}

.action-item--primary {
  background: #1a1a1a;
}

.action-item--primary .action-item__title {
  color: #fff;
}

.action-item__text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.action-item__title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.action-item__desc {
  font-size: 12px;
  line-height: 1.5;
  color: #969799;
}

.action-item__icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f5f6f7;
  color: #323233;
}

.action-item__icon--light {
  background: rgb(255 255 255 / 15%);
  color: #fff;
}

.action-sheet__close {
  position: absolute;
  bottom: calc(72px + env(safe-area-inset-bottom));
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: rgb(80 80 80 / 90%);
  transform: translateX(-50%);
  cursor: pointer;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-active .action-sheet__panel,
.fade-leave-active .action-sheet__panel {
  transition: transform 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-from .action-sheet__panel,
.fade-leave-to .action-sheet__panel {
  transform: translateY(20px);
}
</style>
