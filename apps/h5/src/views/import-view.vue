<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useTripStore } from '../stores/trip'
import { ApiError } from '../api/client'

const router = useRouter()
const tripStore = useTripStore()

const guideText = ref('')
const loading = ref(false)

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

async function handleImport() {
  if (!guideText.value.trim()) {
    showToast('请粘贴攻略文本')
    return
  }

  loading.value = true
  try {
    const trip = await tripStore.addTripFromText(guideText.value)
    showToast('导入成功')
    router.push(`/trip/${trip.id}`)
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
      <p class="import-desc">
        粘贴小红书、公众号等攻略文字，自动识别「第几天」和地点（由后端解析保存）。
      </p>

      <van-field
        v-model="guideText"
        class="import-field"
        rows="12"
        autosize
        type="textarea"
        maxlength="2000"
        show-word-limit
        placeholder="粘贴攻略文本，例如：&#10;第1天&#10;- 宽窄巷子&#10;- 锦里古街"
      />

      <van-button
        type="primary"
        block
        round
        class="submit-btn"
        :loading="loading"
        @click="handleImport"
      >
        开始识别并生成行程
      </van-button>
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
  padding: 16px;
}

.import-desc {
  margin: 0 0 12px;
  font-size: 13px;
  line-height: 1.6;
  color: #646566;
}

.import-field {
  overflow: hidden;
  border-radius: 12px;
  background: #fff;
}

.import-field :deep(.van-field__control) {
  min-height: 220px;
}

.submit-btn {
  margin-top: 20px;
}
</style>
