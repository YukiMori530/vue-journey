import { showToast } from 'vant'

type AppToastOptions = {
  duration?: number
}

export function showAppSuccessToast(message: string, options: AppToastOptions = {}) {
  showToast({
    message,
    duration: options.duration ?? 2000,
    position: 'middle',
    className: 'app-toast app-toast--success',
    icon: 'success',
  })
}

export function showAppFailToast(message: string, options: AppToastOptions = {}) {
  showToast({
    message,
    duration: options.duration ?? 2200,
    position: 'middle',
    className: 'app-toast app-toast--fail',
    icon: 'fail',
  })
}
