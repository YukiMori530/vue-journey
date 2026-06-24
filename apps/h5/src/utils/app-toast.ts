import { showToast } from 'vant'

type AppToastOptions = {
  duration?: number
}

export function showAppSuccessToast(message: string, options: AppToastOptions = {}) {
  showToast({
    type: 'success',
    message,
    duration: options.duration ?? 2000,
    position: 'top',
    className: 'app-toast app-toast--success',
    icon: 'success',
  })
}

export function showAppFailToast(message: string, options: AppToastOptions = {}) {
  showToast({
    type: 'fail',
    message,
    duration: options.duration ?? 2200,
    position: 'top',
    className: 'app-toast app-toast--fail',
    icon: 'fail',
  })
}
