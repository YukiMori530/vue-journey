import AMapLoader from '@amap/amap-jsapi-loader'

declare global {
  interface Window {
    _AMapSecurityConfig?: {
      securityJsCode: string
    }
  }
}

export async function loadAMap(plugins: string[] = []) {
  const key = import.meta.env.VITE_AMAP_KEY
  const securityJsCode = import.meta.env.VITE_AMAP_SECURITY_CODE

  if (!key || !securityJsCode) {
    throw new Error('缺少高德地图 Key，请检查 apps/h5/.env.local')
  }

  // 再次确保（组件懒加载时 main 已执行过 amap-security.ts）
  window._AMapSecurityConfig = { securityJsCode }

  const defaultPlugins = ['AMap.Scale', 'AMap.Geolocation']
  const merged = [...new Set([...defaultPlugins, ...plugins])]

  return AMapLoader.load({
    key,
    version: '2.0',
    plugins: merged,
  })
}
