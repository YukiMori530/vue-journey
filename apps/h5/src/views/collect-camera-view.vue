<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useCollectStore } from '../stores/collect'

const router = useRouter()
const collectStore = useCollectStore()

const videoRef = ref<HTMLVideoElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const streamRef = ref<MediaStream | null>(null)
const locationName = ref('定位中...')
const coords = ref({ lng: 116.397428, lat: 39.90923 })
const capturing = ref(false)
const cameraReady = ref(false)
const useFileFallback = ref(false)

async function initCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    useFileFallback.value = true
    locationName.value = '未开启相机，可选择照片'
    return
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false,
    })
    streamRef.value = stream
    if (videoRef.value) {
      videoRef.value.srcObject = stream
      await videoRef.value.play()
      cameraReady.value = true
    }
  } catch {
    useFileFallback.value = true
    locationName.value = '相机不可用，请选择照片'
  }
}

function resolveLocationName(lng: number, lat: number) {
  if (lng > 115 && lng < 117 && lat > 39 && lat < 41) {
    return '北京市'
  }
  if (lng > 104 && lng < 105 && lat > 30 && lat < 31) {
    return '成都市'
  }
  if (lng > 121 && lng < 122 && lat > 31 && lat < 32) {
    return '上海市'
  }
  if (lng > 121 && lng < 122 && lat > 37 && lat < 38) {
    return '烟台市'
  }
  return '旅途中的地点'
}

async function initLocation() {
  if (!navigator.geolocation) {
    locationName.value = '北京市'
    return
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      coords.value = {
        lng: pos.coords.longitude,
        lat: pos.coords.latitude,
      }
      locationName.value = resolveLocationName(coords.value.lng, coords.value.lat)
    },
    () => {
      locationName.value = '北京市'
    },
    { timeout: 5000 },
  )
}

function stopCamera() {
  streamRef.value?.getTracks().forEach((track) => track.stop())
  streamRef.value = null
}

function close() {
  router.back()
}

function openGallery() {
  router.push('/collect?view=map')
}

function openFilePicker() {
  fileInputRef.value?.click()
}

async function savePhoto(dataUrl: string) {
  collectStore.addItem({
    photo: dataUrl,
    locationName: locationName.value,
    lng: coords.value.lng,
    lat: coords.value.lat,
  })
  showToast('采集成功')
  router.replace('/collect')
}

async function capturePhoto() {
  if (useFileFallback.value) {
    openFilePicker()
    return
  }

  const video = videoRef.value
  if (!video || capturing.value) {
    return
  }

  capturing.value = true
  try {
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 720
    canvas.height = video.videoHeight || 1280
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('canvas unavailable')
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    await savePhoto(canvas.toDataURL('image/jpeg', 0.82))
  } catch {
    showToast('拍摄失败，请重试')
  } finally {
    capturing.value = false
  }
}

async function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) {
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    if (typeof reader.result === 'string') {
      savePhoto(reader.result)
    }
  }
  reader.readAsDataURL(file)
  input.value = ''
}

onMounted(() => {
  initLocation()
  initCamera()
})

onUnmounted(() => {
  stopCamera()
})
</script>

<template>
  <div class="camera-page">
    <video
      v-show="cameraReady && !useFileFallback"
      ref="videoRef"
      class="camera-video"
      playsinline
      muted
    />
    <div v-if="!cameraReady && !useFileFallback" class="camera-placeholder">
      <van-loading vertical color="#fff">相机启动中...</van-loading>
    </div>
    <div v-if="useFileFallback" class="camera-placeholder camera-placeholder--file">
      <van-icon name="photograph" size="48" color="#fff" />
      <p>点击快门选择照片完成采集</p>
    </div>

    <header class="camera-header">
      <button type="button" class="header-btn" aria-label="关闭" @click="close">
        <van-icon name="cross" size="22" color="#fff" />
      </button>
      <button type="button" class="header-btn" aria-label="设置" @click="showToast('设置开发中')">
        <van-icon name="setting-o" size="20" color="#fff" />
      </button>
    </header>

    <div class="focus-frame" aria-hidden="true">
      <span class="corner corner-tl" />
      <span class="corner corner-tr" />
      <span class="corner corner-bl" />
      <span class="corner corner-br" />
    </div>

    <div class="camera-footer">
      <p class="location-pill">
        <van-icon name="location-o" size="14" />
        {{ locationName }}
      </p>

      <div class="shutter-row">
        <button type="button" class="side-btn map-thumb" aria-label="地图" @click="openGallery">
          <img src="/covers/beijing.jpg" alt="" />
        </button>

        <button
          type="button"
          class="shutter-btn"
          :disabled="capturing"
          aria-label="拍摄"
          @click="capturePhoto"
        />

        <button type="button" class="side-btn stamp-btn" aria-label="邮票" @click="openGallery">
          <van-icon name="coupon-o" size="24" color="#111" />
        </button>
      </div>
    </div>

    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      capture="environment"
      class="hidden-input"
      @change="onFileSelected"
    />
  </div>
</template>

<style scoped>
.camera-page {
  position: relative;
  height: 100vh;
  overflow: hidden;
  background: #111;
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: center;
  background: #222;
  color: rgb(255 255 255 / 72%);
  font-size: 14px;
}

.camera-header {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  padding-top: calc(14px + env(safe-area-inset-top));
}

.header-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgb(0 0 0 / 28%);
  cursor: pointer;
}

.focus-frame {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1;
  width: 220px;
  height: 220px;
  transform: translate(-50%, -58%);
}

.corner {
  position: absolute;
  width: 28px;
  height: 28px;
  border: 3px solid rgb(255 255 255 / 92%);
}

.corner-tl {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
}

.corner-tr {
  top: 0;
  right: 0;
  border-left: none;
  border-bottom: none;
}

.corner-bl {
  bottom: 0;
  left: 0;
  border-top: none;
  border-right: none;
}

.corner-br {
  right: 0;
  bottom: 0;
  border-top: none;
  border-left: none;
}

.camera-footer {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2;
  padding: 0 24px calc(28px + env(safe-area-inset-bottom));
}

.location-pill {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  margin: 0 0 24px;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgb(0 0 0 / 42%);
  font-size: 13px;
  color: #fff;
  backdrop-filter: blur(8px);
}

.shutter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.side-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border: none;
  cursor: pointer;
}

.map-thumb {
  overflow: hidden;
  border: 2px solid #fff;
  border-radius: 12px;
  background: #fff;
}

.map-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.stamp-btn {
  border: 2px solid #fff;
  border-radius: 14px;
  background: #fff;
}

.shutter-btn {
  width: 76px;
  height: 76px;
  border: 4px solid rgb(255 255 255 / 85%);
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
}

.shutter-btn:active {
  transform: scale(0.94);
}

.hidden-input {
  display: none;
}
</style>
