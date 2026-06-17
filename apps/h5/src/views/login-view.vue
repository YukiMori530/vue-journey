<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { ApiError } from '../api/client'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const mode = ref<'login' | 'register'>('login')
const email = ref('')
const password = ref('')
const nickname = ref('')
const submitting = ref(false)

function switchMode(next: 'login' | 'register') {
  mode.value = next
}

function fillDemo() {
  mode.value = 'login'
  email.value = 'demo@tuhui.com'
  password.value = '123456'
}

async function handleSubmit() {
  const mail = email.value.trim()
  const pwd = password.value.trim()

  if (!mail) {
    showToast('请输入邮箱')
    return
  }
  if (pwd.length < 6) {
    showToast('密码至少 6 位')
    return
  }
  if (mode.value === 'register' && !nickname.value.trim()) {
    showToast('请输入昵称')
    return
  }

  submitting.value = true
  try {
    if (mode.value === 'register') {
      await authStore.register(mail, pwd, nickname.value.trim())
      showToast('注册成功')
    } else {
      await authStore.login(mail, pwd)
      showToast('登录成功')
    }

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    router.replace(redirect)
  } catch (error) {
    const message = error instanceof ApiError ? error.message : '操作失败，请稍后重试'
    showToast(message)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-bg" aria-hidden="true">
      <span class="blob blob-a" />
      <span class="blob blob-b" />
      <span class="blob blob-c" />
    </div>

    <div class="login-shell">
      <header class="login-hero">
        <div class="logo-wrap">
          <img class="logo" src="/app-logo.svg" alt="途绘" />
        </div>
        <h1 class="login-title">途绘</h1>
        <p class="login-subtitle">把旅行画成一张可执行的地图</p>
      </header>

      <section class="login-card">
        <div class="mode-tabs">
          <button
            type="button"
            class="mode-tab"
            :class="{ active: mode === 'login' }"
            @click="switchMode('login')"
          >
            登录
          </button>
          <button
            type="button"
            class="mode-tab"
            :class="{ active: mode === 'register' }"
            @click="switchMode('register')"
          >
            注册
          </button>
          <span class="mode-indicator" :class="mode" />
        </div>

        <div class="form-block">
          <van-field
            v-model="email"
            class="form-field"
            left-icon="envelop-o"
            placeholder="邮箱"
            clearable
            :border="false"
          />
          <van-field
            v-if="mode === 'register'"
            v-model="nickname"
            class="form-field"
            left-icon="user-o"
            placeholder="昵称"
            clearable
            :border="false"
          />
          <van-field
            v-model="password"
            class="form-field"
            left-icon="lock"
            type="password"
            placeholder="密码"
            :border="false"
          />
        </div>

        <button
          v-if="mode === 'login'"
          type="button"
          class="demo-chip"
          @click="fillDemo"
        >
          <van-icon name="coupon-o" size="14" />
          演示账号：demo@tuhui.com / 123456
        </button>

        <van-button
          type="primary"
          block
          round
          class="submit-btn"
          :loading="submitting"
          @click="handleSubmit"
        >
          {{ mode === 'login' ? '进入途绘' : '注册并登录' }}
        </van-button>
      </section>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 32px 20px;
  overflow: hidden;
  background: linear-gradient(165deg, #dceeff 0%, #eef4fb 38%, #f5f7fa 100%);
}

.login-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.55;
}

.blob-a {
  top: -60px;
  right: -40px;
  width: 220px;
  height: 220px;
  background: #9ec9ff;
}

.blob-b {
  top: 28%;
  left: -70px;
  width: 180px;
  height: 180px;
  background: #b8e0ff;
}

.blob-c {
  right: 10%;
  bottom: 8%;
  width: 140px;
  height: 140px;
  background: #c8daf5;
}

.login-shell {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
}

.login-hero {
  margin-bottom: 28px;
  text-align: center;
}

.logo-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  margin-bottom: 14px;
  border-radius: 22px;
  background: rgb(255 255 255 / 72%);
  box-shadow:
    0 10px 30px rgb(25 137 250 / 14%),
    inset 0 1px 0 rgb(255 255 255 / 90%);
}

.logo {
  width: 46px;
  height: 46px;
}

.login-title {
  margin: 0;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #111;
}

.login-subtitle {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.5;
  color: #646566;
}

.login-card {
  padding: 22px 20px 24px;
  border: 1px solid rgb(255 255 255 / 80%);
  border-radius: 24px;
  background: rgb(255 255 255 / 88%);
  backdrop-filter: blur(12px);
  box-shadow:
    0 16px 40px rgb(25 137 250 / 10%),
    0 2px 8px rgb(0 0 0 / 4%);
}

.mode-tabs {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  padding: 4px;
  margin-bottom: 20px;
  border-radius: 14px;
  background: #edf1f6;
}

.mode-tab {
  position: relative;
  z-index: 1;
  padding: 10px 0;
  border: none;
  border-radius: 11px;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: #646566;
  cursor: pointer;
  transition: color 0.25s ease;
}

.mode-tab.active {
  color: #1989fa;
}

.mode-indicator {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  border-radius: 11px;
  background: #fff;
  box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.mode-indicator.register {
  transform: translateX(100%);
}

.form-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-block :deep(.form-field) {
  overflow: hidden;
  border-radius: 14px;
  background: #f7f9fc;
}

.form-block :deep(.van-field__left-icon) {
  margin-right: 8px;
  color: #969799;
}

.form-block :deep(.van-field__control) {
  font-size: 15px;
}

.demo-chip {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 14px;
  padding: 10px 12px;
  border: 1px dashed #c8daf5;
  border-radius: 12px;
  background: #f3f8ff;
  font-size: 12px;
  color: #576b95;
  cursor: pointer;
  transition: background 0.2s ease;
}

.demo-chip:active {
  background: #e8f2ff;
}

.submit-btn {
  height: 48px;
  margin-top: 18px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #4facfe 0%, #1989fa 55%, #0d6efd 100%);
  box-shadow: 0 10px 24px rgb(25 137 250 / 28%);
}

.submit-btn:active {
  opacity: 0.92;
}
</style>
