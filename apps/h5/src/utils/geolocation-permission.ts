import { showAppConfirmDialog } from './app-dialog'

export type LocationPermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported'

export async function queryLocationPermission(): Promise<LocationPermissionState> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return 'unsupported'
  }

  const permissions = navigator.permissions
  if (!permissions?.query) {
    return 'prompt'
  }

  try {
    const status = await permissions.query({ name: 'geolocation' })
    if (status.state === 'granted' || status.state === 'denied' || status.state === 'prompt') {
      return status.state
    }
    return 'prompt'
  } catch {
    return 'prompt'
  }
}

/** 在用户手势下请求开启定位；返回是否继续尝试定位 */
export async function promptLocationPermission(): Promise<boolean> {
  const state = await queryLocationPermission()
  if (state === 'granted') {
    return true
  }
  if (state === 'denied') {
    await showAppConfirmDialog({
      title: '需要定位权限',
      message: '请在浏览器或系统设置中允许「途绘」访问位置信息，以便定位到您所在城市。',
      confirmText: '我知道了',
      showCancel: false,
      icon: 'location',
    }).catch(() => undefined)
    return false
  }

  try {
    return await showAppConfirmDialog({
      title: '开启定位',
      message: '途绘需要获取您的位置，以便在地图上展示所在城市与附近推荐。',
      confirmText: '允许定位',
      cancelText: '暂不',
      icon: 'location',
    })
  } catch {
    return false
  }
}

/** 浏览器原生 Geolocation，作为高德定位的补充 */
export function getBrowserPosition(timeoutMs = 8000): Promise<{ lng: number; lat: number } | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.resolve(null)
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({ lng: pos.coords.longitude, lat: pos.coords.latitude })
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 60_000 },
    )
  })
}
