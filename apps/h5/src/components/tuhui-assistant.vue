<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAssistantStore } from '../stores/assistant'
import { useAuthStore } from '../stores/auth'
import { chatAssistant } from '../api/ai'
import { ApiError } from '../api/client'
import { showAppFailToast } from '../utils/app-toast'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
}

const route = useRoute()
const authStore = useAuthStore()
const assistantStore = useAssistantStore()

const input = ref('')
const messages = ref<ChatMessage[]>([])
const thinking = ref(false)
const listRef = ref<HTMLElement | null>(null)

const showSheet = computed({
  get: () => assistantStore.show,
  set: (value: boolean) => {
    if (!value) {
      assistantStore.close()
    } else {
      assistantStore.show = true
    }
  },
})

const hideFab = computed(
  () => route.meta.hideAssistant === true || !authStore.isLoggedIn,
)

const fabBottom = computed(() =>
  route.meta.hideTabBar
    ? 'calc(24px + env(safe-area-inset-bottom))'
    : 'calc(84px + env(safe-area-inset-bottom))',
)

const quickPrompts = [
  '帮我规划海南三日游',
  '三亚有什么必去景点？',
  '你是谁，能做什么？',
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
      text: '你好，我是途绘小助手。可以聊旅行、问攻略，也能帮你规划或调整行程。',
    },
  ]
  input.value = assistantStore.draft
  scrollToBottom()
}

watch(showSheet, (visible) => {
  if (visible) {
    resetChat()
  }
})

async function sendMessage(text?: string) {
  if (thinking.value) {
    return
  }
  const content = (text ?? input.value).trim()
  if (!content) {
    return
  }

  input.value = ''
  messages.value.push({ id: `u-${Date.now()}`, role: 'user', text: content })
  scrollToBottom()

  thinking.value = true
  try {
    const reply = await chatAssistant(content, {
      page: String(route.name ?? route.path),
      hint: assistantStore.pageHint || undefined,
    })
    messages.value.push({ id: `a-${Date.now()}`, role: 'assistant', text: reply })
    scrollToBottom()
  } catch (error) {
    showAppFailToast(error instanceof ApiError ? error.message : '回复失败，请稍后再试')
  } finally {
    thinking.value = false
  }
}

function openAssistant() {
  assistantStore.open()
}
</script>

<template>
  <button
    v-if="!hideFab && !showSheet"
    type="button"
    class="tuhui-fab"
    :style="{ bottom: fabBottom }"
    aria-label="途绘助手"
    @click="openAssistant"
  >
    <span class="tuhui-fab__avatar">途</span>
  </button>

  <van-popup
    v-model:show="showSheet"
    position="bottom"
    round
    :style="{ height: '72vh' }"
    class="tuhui-assistant-popup"
  >
    <div class="tuhui-assistant">
      <header class="tuhui-assistant__header">
        <div class="tuhui-assistant__brand">
          <span class="tuhui-assistant__logo">途</span>
          <div>
            <h2>途绘小助手</h2>
            <p>旅行问答 · 攻略推荐 · 行程灵感</p>
          </div>
        </div>
        <button type="button" class="tuhui-assistant__close" aria-label="关闭" @click="showSheet = false">
          <van-icon name="cross" size="18" />
        </button>
      </header>

      <div ref="listRef" class="tuhui-assistant__list">
        <div
          v-for="item in messages"
          :key="item.id"
          class="tuhui-assistant__row"
          :class="item.role === 'user' ? 'tuhui-assistant__row--user' : 'tuhui-assistant__row--bot'"
        >
          <span v-if="item.role === 'assistant'" class="tuhui-assistant__mini-logo">途</span>
          <div
            class="tuhui-assistant__bubble"
            :class="item.role === 'user' ? 'tuhui-assistant__bubble--user' : 'tuhui-assistant__bubble--bot'"
          >
            {{ item.text }}
          </div>
        </div>

        <div v-if="thinking" class="tuhui-assistant__thinking">
          <van-loading size="16" color="#7C5CBF" />
          <span>途绘正在回复…</span>
        </div>
      </div>

      <div class="tuhui-assistant__chips">
        <button
          v-for="prompt in quickPrompts"
          :key="prompt"
          type="button"
          class="tuhui-assistant__chip"
          :disabled="thinking"
          @click="sendMessage(prompt)"
        >
          {{ prompt }}
        </button>
      </div>

      <footer class="tuhui-assistant__footer">
        <input
          v-model="input"
          type="text"
          class="tuhui-assistant__input"
          placeholder="随便聊聊，或说想去的城市…"
          :disabled="thinking"
          @keydown.enter.prevent="sendMessage()"
        />
        <button type="button" class="tuhui-assistant__send" :disabled="thinking || !input.trim()" @click="sendMessage()">
          发送
        </button>
      </footer>
    </div>
  </van-popup>
</template>

<style scoped>
.tuhui-fab {
  position: fixed;
  right: 16px;
  z-index: 120;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #9b7fd4 0%, #7c5cbf 100%);
  box-shadow: 0 8px 24px rgb(124 92 191 / 36%);
  cursor: pointer;
}

.tuhui-fab__avatar {
  font-size: 18px;
  font-weight: 800;
  color: #fff;
}

.tuhui-assistant-popup {
  max-width: 480px;
  margin: 0 auto;
}

.tuhui-assistant {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f7f8fa;
}

.tuhui-assistant__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px 12px;
  background: #fff;
  border-bottom: 1px solid #eef0f3;
}

.tuhui-assistant__brand {
  display: flex;
  gap: 10px;
  align-items: center;
}

.tuhui-assistant__logo,
.tuhui-assistant__mini-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #9b7fd4, #7c5cbf);
  color: #fff;
  font-weight: 800;
}

.tuhui-assistant__logo {
  width: 36px;
  height: 36px;
  font-size: 16px;
}

.tuhui-assistant__mini-logo {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  font-size: 12px;
}

.tuhui-assistant__brand h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #111;
}

.tuhui-assistant__brand p {
  margin: 2px 0 0;
  font-size: 11px;
  color: #969799;
}

.tuhui-assistant__close {
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

.tuhui-assistant__list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.tuhui-assistant__row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.tuhui-assistant__row--user {
  justify-content: flex-end;
}

.tuhui-assistant__bubble {
  max-width: 78%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.55;
}

.tuhui-assistant__bubble--user {
  background: #111;
  color: #fff;
  border-bottom-right-radius: 6px;
}

.tuhui-assistant__bubble--bot {
  background: #fff;
  color: #323233;
  border-bottom-left-radius: 6px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 4%);
}

.tuhui-assistant__thinking {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 10px 14px;
  border-radius: 14px;
  background: #fff;
  font-size: 13px;
  color: #7c5cbf;
}

.tuhui-assistant__chips {
  display: flex;
  gap: 8px;
  padding: 0 16px 10px;
  overflow-x: auto;
  scrollbar-width: none;
}

.tuhui-assistant__chip {
  flex-shrink: 0;
  padding: 8px 12px;
  border: 1px solid #ebedf0;
  border-radius: 999px;
  background: #fff;
  font-size: 12px;
  color: #646566;
  cursor: pointer;
}

.tuhui-assistant__footer {
  display: flex;
  gap: 10px;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid #eef0f3;
}

.tuhui-assistant__input {
  flex: 1;
  padding: 12px 14px;
  border: none;
  border-radius: 999px;
  background: #f2f3f5;
  font-size: 14px;
  outline: none;
}

.tuhui-assistant__send {
  padding: 0 18px;
  border: none;
  border-radius: 999px;
  background: #7c5cbf;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
}

.tuhui-assistant__send:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
