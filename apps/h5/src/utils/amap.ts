import AMapLoader from '@amap/amap-jsapi-loader'

declare global {
  interface Window {
    _AMapSecurityConfig?: {
      securityJsCode: string
    }
  }
}

export async function loadAMap() {
  const key = import.meta.env.VITE_AMAP_KEY
  const securityJsCode = import.meta.env.VITE_AMAP_SECURITY_CODE

  if (!key || !securityJsCode) {
    throw new Error('缺少高德地图 Key，请检查 apps/h5/.env.local')
  }

  window._AMapSecurityConfig = { securityJsCode }

  return AMapLoader.load({
    key,
    version: '2.0',
    plugins: ['AMap.Scale', 'AMap.Geolocation'],
  })
}
