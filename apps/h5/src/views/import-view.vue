<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useTripStore } from '../stores/trip'
import { ApiError } from '../api/client'

const router = useRouter()
const route = useRoute()
const tripStore = useTripStore()

const guideText = ref('')
const loading = ref(false)

const isPhotoMode = computed(() => route.query.mode === 'photo')

const exampleText = `第1天
- 赛里木湖东门
- 果子沟大桥观景
- 伊宁六星街

第2天
- 喀赞其民俗区
- 汉人街美食
- 伊犁河 sunset

第3天
- 那拉提草原
- 网红公路打卡`

function fillExample() {
  guideText.value = exampleText
}

function goBack() {
  router.back()
}

function openPhotoPicker() {
  router.push('/collect/camera')
}

function openXhsSearch() {
  router.push('/import/xhs')
}

async function handleImport() {
  if (!guideText.value.trim()) {
    showToast('请粘贴攻略文本或链接内容')
    return
  }

  loading.value = true
  try {
    const trip = await tripStore.addTripFromText(guideText.value)
    showToast('识别成功')
    router.push(`/trip/${trip.id}?day=1`)
  } catch (error) {
    const message = error instanceof ApiError ? error.message : '导入失败，请确认后端已启动'
    showToast(message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="import-page">
    <header class="import-header">
      <button type="button" class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="20" />
      </button>
      <h1 class="import-title">智能导入</h1>
      <button type="button" class="example-btn" @click="fillExample">示例</button>
    </header>

    <div class="import-body">
      <section class="import-card import-card--active">
        <div class="card-head">
          <van-icon name="link-o" size="18" />
          <h2>文本或链接识别</h2>
        </div>
        <p class="card-desc">
          长按粘贴文本内容/链接进行自动识别。链接解析现已支持：小红书笔记、公众号内容及已公开权限的飞书文档。
        </p>

        <van-field
          v-model="guideText"
          class="import-field"
          rows="6"
          autosize
          type="textarea"
          maxlength="2000"
          placeholder="粘贴攻略文本，例如：&#10;第1天&#10;- 宽窄巷子&#10;- 锦里古街"
        />

        <button
          type="button"
          class="start-btn"
          :disabled="loading"
          @click="handleImport"
        >
          {{ loading ? '识别中...' : '开始识别' }}
        </button>
      </section>

      <section class="import-card import-card--xhs" @click="openXhsSearch">
        <div class="card-head">
          <van-icon name="fire-o" size="18" color="#ff2442" />
          <h2>搜索小红书笔记</h2>
        </div>
        <p class="card-desc">按目的地搜索精选笔记，一键导入并在地图上查看每日路线</p>
        <span class="card-link">去搜索 ></span>
      </section>

      <section
        class="import-card import-card--muted"
        :class="{ highlight: isPhotoMode }"
        @click="openPhotoPicker"
      >
        <div class="card-head">
          <van-icon name="photo-o" size="18" />
          <h2>截图识别</h2>
        </div>
        <p class="card-desc">选择含有地点信息的页面截图</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.import-page {
  min-height: 100vh;
  background: #f5f6f7;
}

.import-header {
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

.import-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
}

.example-btn {
  border: none;
  background: transparent;
  font-size: 14px;
  color: #1989fa;
  cursor: pointer;
}

.import-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
}

.import-card {
  padding: 18px 16px;
  border-radius: 18px;
  background: #fff;
}

.import-card--active {
  border: 2px solid #111;
}

.import-card--xhs {
  cursor: pointer;
  background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
  border: 1px solid rgb(255 36 66 / 12%);
}

.card-link {
  font-size: 13px;
  font-weight: 600;
  color: #ff2442;
}

.import-card--muted {
  background: #eceff3;
  cursor: pointer;
}

.import-card--muted.highlight {
  box-shadow: 0 0 0 2px #111 inset;
}

.card-head {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
}

.card-head h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #111;
}

.card-desc {
  margin: 0 0 14px;
  font-size: 13px;
  line-height: 1.6;
  color: #646566;
}

.import-field {
  overflow: hidden;
  margin-bottom: 14px;
  border-radius: 12px;
  background: #f7f8fa;
}

.import-field :deep(.van-field__control) {
  min-height: 120px;
}

.start-btn {
  display: block;
  margin-left: auto;
  padding: 10px 22px;
  border: none;
  border-radius: 999px;
  background: #111;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
}

.start-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.hidden-input {
  display: none;
}
</style>
