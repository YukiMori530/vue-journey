<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import type { Trip } from '../types/trip'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
}

const props = defineProps<{
  trip: Trip
  busy?: boolean
}>()

const show = defineModel<boolean>('show', { default: false })

const emit = defineEmits<{
  submit: [message: string]
}>()

const input = ref('')
const messages = ref<ChatMessage[]>([])
const thinkingSteps = ref<string[]>([])
const listRef = ref<HTMLElement | null>(null)

const quickPrompts = [
  '每天景点少一点，2～3 个就好',
  '长城单独一天，不要和市区混排',
  '多安排一些本地美食',
  '第二天改成胡同逛吃',
]

function scrollToBottom() {
  nextTick(() => {
    const el = listRef.value
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  })
}

function resetChat() {
  messages.value = [
    {
      id: 'welcome',
      role: 'assistant',
      text: '有什么想调整的？告诉我你的想法，途绘会重新规划并更新地图。',
    },
  ]
  thinkingSteps.value = []
  input.value = ''
}

watch(
  () => [show.value, props.trip.id] as const,
  ([visible]) => {
    if (visible) {
      resetChat()
      scrollToBottom()
    }
  },
)

function pushUserMessage(text: string) {
  messages.value.push({
    id: `u-${Date.now()}`,
    role: 'user',
    text,
  })
  scrollToBottom()
}

function pushAssistantMessage(text: string) {
  messages.value.push({
    id: `a-${Date.now()}`,
    role: 'assistant',
    text,
  })
  scrollToBottom()
}

function beginThinking() {
  thinkingSteps.value = ['途绘收到，开始分析你的需求…']
  scrollToBottom()
}

function appendThinkingStep(text: string) {
  if (!thinkingSteps.value.length) {
    thinkingSteps.value = [text]
  } else {
    thinkingSteps.value = [...thinkingSteps.value, text]
  }
  scrollToBottom()
}

function finishThinking(summary: string) {
  thinkingSteps.value = []
  pushAssistantMessage(summary)
}

function failThinking(message: string) {
  thinkingSteps.value = []
  pushAssistantMessage(message)
}

function sendMessage(text?: string) {
  if (props.busy) {
    return
  }
  const content = (text ?? input.value).trim()
  if (!content) {
    return
  }
  input.value = ''
  pushUserMessage(content)
  beginThinking()
  emit('submit', content)
}

defineExpose({
  appendThinkingStep,
  finishThinking,
  failThinking,
})
</script>

<template>
  <van-popup
    v-model:show="show"
    position="bottom"
    round
    :style="{ height: '72vh' }"
    class="trip-chat-popup"
  >
    <div class="trip-chat">
      <header class="trip-chat__header">
        <div>
          <h2 class="trip-chat__title">和途绘聊聊</h2>
          <p class="trip-chat__subtitle">说出你想改的地方，AI 会重新规划行程</p>
        </div>
        <button type="button" class="trip-chat__close" aria-label="关闭" @click="show = false">
          <van-icon name="cross" size="18" />
        </button>
      </header>

      <div ref="listRef" class="trip-chat__list">
        <div
          v-for="item in messages"
          :key="item.id"
          class="trip-chat__bubble-row"
          :class="item.role === 'user' ? 'trip-chat__bubble-row--user' : 'trip-chat__bubble-row--bot'"
        >
          <div v-if="item.role === 'assistant'" class="trip-chat__avatar">途</div>
          <div
            class="trip-chat__bubble"
            :class="{
              'trip-chat__bubble--user': item.role === 'user',
              'trip-chat__bubble--bot': item.role === 'assistant',
            }"
          >
            {{ item.text }}
          </div>
        </div>

        <div v-if="thinkingSteps.length" class="trip-chat__thinking">
          <div class="trip-chat__thinking-head">
            <van-loading size="16" color="#7C5CBF" />
            <span>途绘思考中</span>
          </div>
          <ul class="trip-chat__thinking-list">
            <li
              v-for="(step, index) in thinkingSteps"
              :key="`${index}-${step}`"
              class="trip-chat__thinking-item"
              :class="{ active: index === thinkingSteps.length - 1 }"
            >
              {{ step }}
            </li>
          </ul>
        </div>
      </div>

      <div class="trip-chat__chips">
        <button
          v-for="prompt in quickPrompts"
          :key="prompt"
          type="button"
          class="trip-chat__chip"
          :disabled="busy"
          @click="sendMessage(prompt)"
        >
          {{ prompt }}
        </button>
      </div>

      <footer class="trip-chat__footer">
        <input
          v-model="input"
          type="text"
          class="trip-chat__input"
          placeholder="例如：第三天想轻松一点，少排景点"
          :disabled="busy"
          @keydown.enter.prevent="sendMessage()"
        />
        <button
          type="button"
          class="trip-chat__send"
          :disabled="!input.trim() || busy"
          @click="sendMessage()"
        >
          {{ busy ? '调整中' : '发送' }}
        </button>
      </footer>
    </div>
  </van-popup>
</template>

<style scoped>
.trip-chat-popup {
  max-width: 480px;
  margin: 0 auto;
}

.trip-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f7f8fa;
}

.trip-chat__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 18px 18px 12px;
  background: #fff;
  border-bottom: 1px solid #eef0f3;
}

.trip-chat__title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #111;
}

.trip-chat__subtitle {
  margin: 4px 0 0;
  font-size: 12px;
  color: #969799;
}

.trip-chat__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #f2f3f5;
  cursor: pointer;
}

.trip-chat__list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.trip-chat__bubble-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.trip-chat__bubble-row--user {
  justify-content: flex-end;
}

.trip-chat__avatar {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #9b7fd4, #7c5cbf);
  font-size: 12px;
  font-weight: 700;
  line-height: 28px;
  text-align: center;
  color: #fff;
}

.trip-chat__bubble {
  max-width: 78%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.55;
}

.trip-chat__bubble--user {
  background: #111;
  color: #fff;
  border-bottom-right-radius: 6px;
}

.trip-chat__bubble--bot {
  background: #fff;
  color: #323233;
  border-bottom-left-radius: 6px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 4%);
}

.trip-chat__thinking {
  padding: 12px 14px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 2px 10px rgb(124 92 191 / 10%);
}

.trip-chat__thinking-head {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #7c5cbf;
}

.trip-chat__thinking-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.trip-chat__thinking-item {
  position: relative;
  padding: 6px 0 6px 14px;
  font-size: 13px;
  line-height: 1.5;
  color: #969799;
}

.trip-chat__thinking-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 12px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #dcdee0;
}

.trip-chat__thinking-item.active {
  color: #323233;
}

.trip-chat__thinking-item.active::before {
  background: #7c5cbf;
}

.trip-chat__chips {
  display: flex;
  gap: 8px;
  padding: 0 16px 10px;
  overflow-x: auto;
  scrollbar-width: none;
}

.trip-chat__chips::-webkit-scrollbar {
  display: none;
}

.trip-chat__chip {
  flex-shrink: 0;
  padding: 8px 12px;
  border: 1px solid #ebedf0;
  border-radius: 999px;
  background: #fff;
  font-size: 12px;
  color: #646566;
  cursor: pointer;
}

.trip-chat__chip:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.trip-chat__footer {
  display: flex;
  gap: 10px;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid #eef0f3;
}

.trip-chat__input {
  flex: 1;
  padding: 12px 14px;
  border: none;
  border-radius: 999px;
  background: #f2f3f5;
  font-size: 14px;
  outline: none;
}

.trip-chat__input:disabled {
  opacity: 0.7;
}

.trip-chat__send {
  padding: 0 18px;
  border: none;
  border-radius: 999px;
  background: #7c5cbf;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
}

.trip-chat__send:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
