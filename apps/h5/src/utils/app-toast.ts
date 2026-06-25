import { ref } from 'vue'

export type AppToastKind = 'success' | 'fail' | 'info' | 'plain' | 'loading'

type AppToastOptions = {
  duration?: number
}

const PENDING_TOAST_KEY = 'tuhui:pending-toast'

export const toastVisible = ref(false)
export const toastMessage = ref('')
export const toastKind = ref<AppToastKind>('plain')

let dismissTimer: ReturnType<typeof setTimeout> | undefined

function clearDismissTimer() {
  if (dismissTimer !== undefined) {
    clearTimeout(dismissTimer)
    dismissTimer = undefined
  }
}

function hideToast() {
  clearDismissTimer()
  toastVisible.value = false
  toastMessage.value = ''
}

function showToastInternal(
  message: string,
  kind: AppToastKind,
  duration: number,
) {
  clearDismissTimer()
  toastKind.value = kind
  toastMessage.value = message
  toastVisible.value = true

  if (duration > 0) {
    dismissTimer = setTimeout(() => {
      hideToast()
    }, duration)
  }
}

export function showAppSuccessToast(message: string, options: AppToastOptions = {}) {
  showToastInternal(message, 'success', options.duration ?? 1200)
}

export function showAppFailToast(message: string, options: AppToastOptions = {}) {
  showToastInternal(message, 'fail', options.duration ?? 1800)
}

export function showAppInfoToast(message: string, options: AppToastOptions = {}) {
  showToastInternal(message, 'info', options.duration ?? 1600)
}

export function showAppLoadingToast(message = '请稍候…') {
  showToastInternal(message, 'loading', 0)
}

export function closeAppToast() {
  hideToast()
}

export function showAppToast(message: string, options: AppToastOptions = {}) {
  showToastInternal(message, 'plain', options.duration ?? 1600)
}

export function queueAppSuccessToast(message: string) {
  sessionStorage.setItem(
    PENDING_TOAST_KEY,
    JSON.stringify({ type: 'success', message }),
  )
}

export function flushPendingAppToast() {
  const raw = sessionStorage.getItem(PENDING_TOAST_KEY)
  if (!raw) {
    return
  }
  sessionStorage.removeItem(PENDING_TOAST_KEY)
  try {
    const payload = JSON.parse(raw) as { type?: string; message?: string }
    if (payload.type === 'success' && payload.message) {
      showAppSuccessToast(payload.message)
    }
  } catch {
    // ignore malformed payload
  }
}
