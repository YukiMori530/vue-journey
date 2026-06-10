<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()
const destination = ref('')
const days = ref('')
const preferences = ['美食', '摄影', '自然风光', '人文历史']
const selectedPrefs = ref<string[]>([])

function togglePref(item: string) {
  const index = selectedPrefs.value.indexOf(item)
  if (index >= 0) {
    selectedPrefs.value.splice(index, 1)
  } else {
    selectedPrefs.value.push(item)
  }
}

function handleSubmit() {
  if (!destination.value.trim()) {
    showToast('请输入目的地')
    return
  }
  if (!days.value.trim()) {
    showToast('请输入天数')
    return
  }
  showToast('行程创建成功（后续接入 AI）')
  router.push('/')
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="create-page">
    <header class="create-header">
      <button type="button" class="back-btn" @click="goBack">
        <van-icon name="cross" size="20" />
      </button>
      <h1 class="create-title">新建行程</h1>
      <span class="placeholder" />
    </header>

    <div class="create-body">
      <van-cell-group inset>
        <van-field
          v-model="destination"
          label="目的地"
          placeholder="例如：成都、烟台"
        />
        <van-field
          v-model="days"
          label="天数"
          type="digit"
          placeholder="例如：3"
        />
      </van-cell-group>

      <p class="pref-label">旅行偏好</p>
      <div class="pref-tags">
        <button
          v-for="item in preferences"
          :key="item"
          type="button"
          class="pref-tag"
          :class="{ active: selectedPrefs.includes(item) }"
          @click="togglePref(item)"
        >
          {{ item }}
        </button>
      </div>

      <van-button type="primary" block round class="submit-btn" @click="handleSubmit">
        生成行程
      </van-button>
    </div>
  </div>
</template>

<style scoped>
.create-page {
  min-height: 100vh;
  padding-bottom: 24px;
  background: #f5f6f7;
}

.create-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #f5f6f7;
  cursor: pointer;
}

.create-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
}

.placeholder {
  width: 36px;
}

.create-body {
  padding: 16px 0;
}

.pref-label {
  margin: 20px 16px 10px;
  font-size: 14px;
  color: #646566;
}

.pref-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 0 16px;
}

.pref-tag {
  padding: 8px 16px;
  border: 1px solid #ebedf0;
  border-radius: 20px;
  background: #fff;
  font-size: 14px;
  color: #646566;
  cursor: pointer;
}

.pref-tag.active {
  border-color: #1989fa;
  background: #ecf5ff;
  color: #1989fa;
}

.submit-btn {
  margin: 32px 16px 0;
}
</style>
