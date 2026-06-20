/** 必须在加载高德 JS API 之前设置，否则底图瓦片会加载失败（灰屏） */
declare global {
  interface Window {
    _AMapSecurityConfig?: {
      securityJsCode: string
    }
  }
}

const securityJsCode = import.meta.env.VITE_AMAP_SECURITY_CODE
if (securityJsCode) {
  window._AMapSecurityConfig = { securityJsCode }
}
