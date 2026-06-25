import { closeToast, showToast } from 'vant'

type AppToastOptions = {
  duration?: number
}

const BASE_TOAST = {
  position: 'middle' as const,
  className: 'app-toast',
  transition: 'van-fade' as const,
}

function openAppToast(options: Record<string, unknown>) {
  closeToast()
  showToast({
    ...BASE_TOAST,
    ...options,
  })
}

export function showAppSuccessToast(message: string, options: AppToastOptions = {}) {
  openAppToast({
    message,
    duration: options.duration ?? 2200,
    className: 'app-toast app-toast--success',
    icon: 'success',
  })
}

export function showAppFailToast(message: string, options: AppToastOptions = {}) {
  openAppToast({
    message,
    duration: options.duration ?? 2400,
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
