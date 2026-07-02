import { showAppConfirmDialog } from './app-dialog'

export type LocationConsent = 'granted' | 'dismissed'

export type LocationPermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported'

const LOCATION_CONSENT_KEY = 'tuhui:location-consent'

export function getLocationConsent(): LocationConsent | null {
  if (typeof localStorage === 'undefined') {
    return null
  }
  const value = localStorage.getItem(LOCATION_CONSENT_KEY)
  return value === 'granted' || value === 'dismissed' ? value : null
}

export function setLocationConsent(consent: LocationConsent) {
  if (typeof localStorage === 'undefined') {
    return
  }
  localStorage.setItem(LOCATION_CONSENT_KEY, consent)
}

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

/** 是否已有可用定位（本地记录 / 权限 API / 静默读取缓存坐标） */
export async function hasWorkingGeolocation(): Promise<boolean> {
  if (getLocationConsent() === 'granted') {
    return true
  }

  const state = await queryLocationPermission()
  if (state === 'granted') {
    setLocationConsent('granted')
    return true
  }

  const cached = await getBrowserPosition(2500)
  if (cached) {
    setLocationConsent('granted')
    return true
  }

  return false
}

/** 在用户手势下请求开启定位；返回是否继续尝试定位 */
export async function promptLocationPermission(): Promise<boolean> {
  if (await hasWorkingGeolocation()) {
    return true
  }

  if (getLocationConsent() === 'dismissed') {
    return false
  }

  const state = await queryLocationPermission()
  if (state === 'denied') {
    await showAppConfirmDialog({
      title: '需要定位权限',
      message: '请在浏览器或系统设置中允许「途绘」访问位置信息，以便定位到您所在城市。',
      confirmText: '我知道了',
      showCancel: false,
      icon: 'location',
    }).catch(() => undefined)
    setLocationConsent('dismissed')
    return false
  }

  try {
    const confirmed = await showAppConfirmDialog({
      title: '开启定位',
      message: '途绘需要获取您的位置，以便在地图上展示所在城市与附近推荐。',
      confirmText: '允许定位',
      cancelText: '暂不',
      icon: 'location',
    })
    setLocationConsent(confirmed ? 'granted' : 'dismissed')
    return confirmed
  } catch {
    setLocationConsent('dismissed')
    return false
  }
}

/** 探索页首次进入：仅在从未询问过时弹窗 */
export async function ensureExploreLocationConsent(): Promise<boolean> {
  if (await hasWorkingGeolocation()) {
    return true
  }
  if (getLocationConsent() != null) {
    return getLocationConsent() === 'granted'
  }
  return promptLocationPermission()
}

/** 用户主动点定位按钮：已授权则直接定位，否则再询问 */
export async function ensureLocationForAction(): Promise<boolean> {
  if (await hasWorkingGeolocation()) {
    return true
  }
  return promptLocationPermission()
}
