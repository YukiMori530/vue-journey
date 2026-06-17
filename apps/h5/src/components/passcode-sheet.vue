<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { hotTrips } from '../data/discover'
import { passcodeHotTripMap } from '../data/explore-discover'
import { useTripStore } from '../stores/trip'
import { ApiError } from '../api/client'

const show = defineModel<boolean>('show', { default: false })

const router = useRouter()
const tripStore = useTripStore()

const digits = ref(['', '', '', ''])
const loading = ref(false)
const inputRefs = ref<HTMLInputElement[]>([])

const code = computed(() => digits.value.join(''))
const todayLabel = computed(() => {
  const now = new Date()
  return `${now.getDate()} / ${now.getMonth() + 1}月`
})

watch(show, (visible) => {
  if (visible) {
    digits.value = ['', '', '', '']
    setTimeout(() => inputRefs.value[0]?.focus(), 200)
  }
})

function close() {
  show.value = false
}

function setInputRef(el: unknown, index: number) {
  if (el) {
    inputRefs.value[index] = el as HTMLInputElement
  }
}

function onDigitInput(index: number, event: Event) {
  const input = event.target as HTMLInputElement
  const value = input.value.replace(/\D/g, '').slice(-1)
  digits.value[index] = value
  input.value = value

  if (value && index < 3) {
    inputRefs.value[index + 1]?.focus()
  }

  if (digits.value.every((d) => d)) {
    submitCode()
  }
}

function onDigitKeydown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace' && !digits.value[index] && index > 0) {
    inputRefs.value[index - 1]?.focus()
  }
}

async function submitCode() {
  if (code.value.length < 4 || loading.value) {
    return
  }

  const hotTripId = passcodeHotTripMap[code.value]
  if (!hotTripId) {
    showToast('口令无效，试试 8888')
    digits.value = ['', '', '', '']
    inputRefs.value[0]?.focus()
    return
  }

  const hotTrip = hotTrips.find((item) => item.id === hotTripId)
  if (!hotTrip) {
    showToast('行程不存在')
    return
  }

  loading.value = true
  try {
    const trip = await tripStore.addTripFromHotTrip(hotTrip)
    showToast('已通过口令复制行程')
    close()
    router.push(`/trip/${trip.id}`)
  } catch (error) {
    const message = error instanceof ApiError ? error.message : '复制失败'
    showToast(message)
    digits.value = ['', '', '', '']
    inputRefs.value[0]?.focus()
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="passcode-page">
      <header class="passcode-header">
        <button type="button" class="cancel-btn" @click="close">取消</button>
      </header>

      <div class="ticket-wrap">
        <div class="ticket">
          <div class="ticket-stub">
            <span>复制行程</span>
            <van-icon name="arrow" size="14" />
          </div>

          <div class="ticket-body">
            <p class="ticket-brand">ITINERARY</p>
            <div class="ticket-top">
              <h2 class="ticket-title">输入行程口令</h2>
              <span class="ticket-date">{{ todayLabel }}</span>
            </div>

            <div class="digit-row">
              <input
                v-for="(_, index) in digits"
                :key="index"
                :ref="(el) => setInputRef(el, index)"
                class="digit-input"
                type="tel"
                maxlength="1"
                inputmode="numeric"
                :value="digits[index]"
                :disabled="loading"
                @input="onDigitInput(index, $event)"
                @keydown="onDigitKeydown(index, $event)"
              />
            </div>

            <div class="ticket-divider" />
            <div class="barcode" aria-hidden="true" />
            <p class="ticket-footer">Designed By 途绘</p>
          </div>
        </div>
      </div>

      <p class="passcode-tip">演示口令：8888 / 6666 / 5200</p>
    </div>
  </Transition>
</template>

<style scoped>
.passcode-page {
  position: fixed;
  inset: 0;
  z-index: 300;
  max-width: 480px;
  margin: 0 auto;
  background: rgb(0 0 0 / 55%);
}

.passcode-header {
  padding: 12px 16px;
}

.cancel-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 999px;
  background: rgb(255 255 255 / 18%);
  font-size: 14px;
  color: #fff;
  cursor: pointer;
}

.ticket-wrap {
  display: flex;
  justify-content: center;
  padding: 24px 20px 0;
}

.ticket {
  width: 100%;
  max-width: 320px;
  overflow: hidden;
  border: 2px solid #111;
  border-radius: 4px;
  background: #fff;
}

.ticket-stub {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 2px dashed #111;
  font-size: 13px;
  font-weight: 600;
}

.ticket-body {
  padding: 20px 18px 18px;
}

.ticket-brand {
  margin: 0 0 16px;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 2px;
  color: transparent;
  -webkit-text-stroke: 1.5px #111;
}

.ticket-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.ticket-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #111;
}

.ticket-date {
  flex-shrink: 0;
  padding: 4px 8px;
  border: 1px solid #111;
  font-size: 12px;
  font-weight: 600;
}

.digit-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.digit-input {
  width: 100%;
  height: 52px;
  border: 2px solid #111;
  border-radius: 12px;
  background: #fff;
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  color: #111;
}

.digit-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgb(17 17 17 / 15%);
}

.ticket-divider {
  height: 1px;
  margin: 20px 0 14px;
  background: repeating-linear-gradient(
    90deg,
    #111 0,
    #111 4px,
    transparent 4px,
    transparent 8px
  );
}

.barcode {
  height: 42px;
  background: repeating-linear-gradient(
    90deg,
    #111 0,
    #111 2px,
    transparent 2px,
    transparent 5px
  );
  opacity: 0.85;
}

.ticket-footer {
  margin: 12px 0 0;
  font-size: 11px;
  color: #969799;
  text-align: center;
}

.passcode-tip {
  margin: 20px 0 0;
  font-size: 12px;
  color: rgb(255 255 255 / 72%);
  text-align: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
