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
    <div class="login-card">
      <h1 class="login-title">途绘</h1>
      <p class="login-subtitle">登录后管理你的旅行计划</p>

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
      </div>

      <van-cell-group inset>
        <van-field v-model="email" label="邮箱" placeholder="you@example.com" />
        <van-field
          v-if="mode === 'register'"
          v-model="nickname"
          label="昵称"
          placeholder="怎么称呼你"
        />
        <van-field
          v-model="password"
          label="密码"
          type="password"
          placeholder="至少 6 位"
        />
      </van-cell-group>

      <van-button
        type="primary"
        block
        round
        class="submit-btn"
        :loading="submitting"
        @click="handleSubmit"
      >
        {{ mode === 'login' ? '登录' : '注册并登录' }}
      </van-button>

      <p class="login-tip">探索页无需登录；创建和管理行程需要登录</p>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px 16px;
  background: linear-gradient(180deg, #ecf5ff 0%, #f5f6f7 40%);
}

.login-card {
  width: 100%;
  max-width: 420px;
}

.login-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  text-align: center;
}

.login-subtitle {
  margin: 8px 0 24px;
  font-size: 14px;
  color: #646566;
  text-align: center;
}

.mode-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.mode-tab {
  flex: 1;
  padding: 10px 0;
  border: none;
  border-radius: 999px;
  background: rgb(255 255 255 / 80%);
  font-size: 14px;
  color: #646566;
  cursor: pointer;
}

.mode-tab.active {
  background: #1989fa;
  color: #fff;
}

.submit-btn {
  margin-top: 24px;
}

.login-tip {
  margin: 16px 0 0;
  font-size: 12px;
  color: #969799;
  text-align: center;
}
</style>
