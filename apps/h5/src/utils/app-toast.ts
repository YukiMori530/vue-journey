import { closeToast, showToast } from 'vant'

type AppToastOptions = {
  duration?: number
}

const PENDING_TOAST_KEY = 'tuhui:pending-toast'

const BASE_TOAST = {
  position: 'middle' as const,
  className: 'app-toast',
  transition: 'van-fade' as const,
  overlay: false,
  closeOnClick: false,
  closeOnClickOverlay: false,
}

let dismissTimer: ReturnType<typeof setTimeout> | undefined

function clearDismissTimer() {
  if (dismissTimer !== undefined) {
    clearTimeout(dismissTimer)
    dismissTimer = undefined
  }
}

function openAppToast(options: Record<string, unknown>) {
  closeToast()
  clearDismissTimer()

  const duration =
    typeof options.duration === 'number' ? options.duration : 2000

  showToast({
    ...BASE_TOAST,
    ...options,
    duration,
  })

  if (duration > 0) {
    dismissTimer = setTimeout(() => {
      closeToast()
      dismissTimer = undefined
    }, duration)
  }
}

export function showAppSuccessToast(message: string, options: AppToastOptions = {}) {
  openAppToast({
    message,
    duration: options.duration ?? 1500,
    className: 'app-toast app-toast--success',
    icon: 'success',
  })
}

export function showAppFailToast(message: string, options: AppToastOptions = {}) {
  openAppToast({
    message,
    duration: options.duration ?? 2000,
    className: 'app-toast app-toast--fail',
    icon: 'fail',
  })
}

export function showAppInfoToast(message: string, options: AppToastOptions = {}) {
  openAppToast({
    message,
    duration: options.duration ?? 2000,
    className: 'app-toast app-toast--info',
    icon: 'info-o',
  })
}

export function showAppLoadingToast(message = '请稍候…') {
  openAppToast({
    message,
    type: 'loading',
    duration: 0,
    forbidClick: true,
    className: 'app-toast app-toast--loading',
  })
}

export function closeAppToast() {
  clearDismissTimer()
  closeToast()
}

/** 统一的信息提示，替代默认 van toast */
export function showAppToast(message: string, options: AppToastOptions = {}) {
  openAppToast({
    message,
    duration: options.duration ?? 2000,
    className: 'app-toast app-toast--plain',
  })
}

/** 跳转后再弹出提示，避免路由切换时 Toast 无法自动关闭 */
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
