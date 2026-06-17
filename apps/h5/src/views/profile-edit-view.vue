<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import ProfileNavBar from '../components/profile-nav-bar.vue'
import { useAuthStore } from '../stores/auth'
import { useProfileStore } from '../stores/profile'

const router = useRouter()
const authStore = useAuthStore()
const profileStore = useProfileStore()

const nickname = ref(authStore.user?.nickname ?? '')
const residence = ref(profileStore.residence)
const showResidencePicker = ref(false)
const residenceInput = ref(profileStore.residence)

function goBack() {
  router.back()
}

function save() {
  if (!nickname.value.trim()) {
    showToast('名字不能为空')
    return
  }
  if (authStore.user) {
    authStore.user = { ...authStore.user, nickname: nickname.value.trim() }
  }
  profileStore.setResidence(residence.value)
  showToast('已保存')
  router.back()
}

function openResidenceEdit() {
  residenceInput.value = residence.value
  showResidencePicker.value = true
}

function confirmResidence() {
  residence.value = residenceInput.value.trim()
  showResidencePicker.value = false
}
</script>

<template>
  <div class="edit-page">
    <ProfileNavBar title="编辑资料" @back="goBack">
      <template #right>
        <button type="button" class="save-btn" @click="save">保存</button>
      </template>
    </ProfileNavBar>

    <div class="edit-body">
      <div class="avatar-wrap">
        <img class="avatar" :src="profileStore.avatarUrl" alt="头像" />
      </div>

      <label class="field">
        <span class="field-label">名字</span>
        <input v-model="nickname" type="text" class="field-input" placeholder="输入昵称" />
      </label>

      <div class="field">
        <span class="field-label">常住地</span>
        <button type="button" class="field-input field-input--picker" @click="openResidenceEdit">
          <span :class="{ placeholder: !residence }">{{ residence || '暂未设置' }}</span>
          <span class="field-action">修改</span>
        </button>
      </div>
    </div>

    <van-popup v-model:show="showResidencePicker" round position="bottom">
      <div class="residence-sheet">
        <p class="residence-sheet__title">设置常住地</p>
        <input
          v-model="residenceInput"
          type="text"
          class="residence-sheet__input"
          placeholder="例如：上海"
        />
        <button type="button" class="residence-sheet__btn" @click="confirmResidence">确定</button>
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.edit-page {
  min-height: 100vh;
  background: #fff;
}

.save-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 999px;
  background: #111;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
}

.edit-body {
  padding: 24px 20px;
}

.avatar-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
}

.field {
  display: block;
  margin-bottom: 20px;
}

.field-label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  color: #969799;
}

.field-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #ebedf0;
  border-radius: 14px;
  background: #fff;
  font-size: 15px;
  color: #111;
  box-sizing: border-box;
}

.field-input--picker {
  border: none;
  cursor: pointer;
}

.field-input .placeholder {
  color: #c8c9cc;
}

.field-action {
  font-size: 14px;
  color: #969799;
}

.residence-sheet {
  padding: 24px 20px calc(24px + env(safe-area-inset-bottom));
}

.residence-sheet__title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
}

.residence-sheet__input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #ebedf0;
  border-radius: 14px;
  font-size: 15px;
  box-sizing: border-box;
}

.residence-sheet__btn {
  width: 100%;
  margin-top: 16px;
  padding: 14px;
  border: none;
  border-radius: 999px;
  background: #111;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
}
</style>
