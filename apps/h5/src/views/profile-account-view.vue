<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import ProfileNavBar from '../components/profile-nav-bar.vue'
import LogoutDialog from '../components/logout-dialog.vue'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const showLogout = ref(false)

const uid = computed(() => {
  const id = authStore.user?.id ?? 0
  return id.toString(16).padStart(16, '0')
})

function goBack() {
  router.back()
}

function handleLogout() {
  authStore.logout()
  showToast('已退出登录')
  router.push('/login')
}
</script>

<template>
  <div class="account-page">
    <ProfileNavBar title="账号与安全" @back="goBack" />

    <div class="account-body">
      <p class="section-label">账号</p>
      <div class="cell-group">
        <div class="cell">
          <span>手机号</span>
          <span class="cell-value">未绑定</span>
        </div>
        <div class="cell">
          <span>邮箱</span>
          <span class="cell-value">{{ authStore.user?.email ?? '—' }}</span>
        </div>
      </div>

      <p class="section-label">注销</p>
      <div class="cell-group">
        <button type="button" class="cell cell--danger" @click="showToast('注销功能开发中')">
          <span>注销帐号</span>
          <van-icon name="arrow" size="14" color="#ee0a24" />
        </button>
      </div>

      <p class="uid">UID: {{ uid }}</p>

      <button type="button" class="logout-btn" @click="showLogout = true">退出登录</button>
    </div>

    <LogoutDialog
      v-model:show="showLogout"
      :username="authStore.displayName"
      @confirm="handleLogout"
    />
  </div>
</template>

<style scoped>
.account-page {
  min-height: 100vh;
  background: #fff;
}

.account-body {
  padding: 8px 16px 32px;
}

.section-label {
  margin: 16px 0 8px 4px;
  font-size: 13px;
  color: #969799;
}

.cell-group {
  overflow: hidden;
  border-radius: 14px;
  background: #f7f8fa;
}

.cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 16px;
  border: none;
  border-bottom: 1px solid #eee;
  background: transparent;
  font-size: 15px;
  color: #323233;
  text-align: left;
  cursor: pointer;
}

.cell:last-child {
  border-bottom: none;
}

.cell-value {
  color: #969799;
}

.cell--danger {
  color: #ee0a24;
}

.uid {
  margin: 20px 4px 0;
  font-size: 12px;
  color: #c8c9cc;
}

.logout-btn {
  display: block;
  width: 100%;
  margin-top: 48px;
  padding: 14px;
  border: 1px solid #ee0a24;
  border-radius: 999px;
  background: #fff;
  font-size: 15px;
  font-weight: 600;
  color: #ee0a24;
  cursor: pointer;
}
</style>
