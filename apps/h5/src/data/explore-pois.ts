export type PoiCategory = '景点' | '美食' | '饮品' | '购物' | '住宿'

export interface ExplorePoi {
  id: string
  name: string
  category: PoiCategory
  icon: string
  lng: number
  lat: number
}

/** 北京示例 POI，后续可接高德 Place Search API */
export const explorePois: ExplorePoi[] = [
  { id: '1', name: '故宫博物院', category: '景点', icon: '🏛️', lng: 116.397026, lat: 39.918058 },
  { id: '2', name: '颐和园', category: '景点', icon: '🌳', lng: 116.275179, lat: 39.999617 },
  { id: '3', name: '国家体育场', category: '景点', icon: '🎭', lng: 116.396574, lat: 39.992806 },
  { id: '4', name: '南锣鼓巷', category: '美食', icon: '🍜', lng: 116.403874, lat: 39.936316 },
  { id: '5', name: '簋街', category: '美食', icon: '🦞', lng: 116.424089, lat: 39.941462 },
  { id: '6', name: '三里屯太古里', category: '购物', icon: '🛍️', lng: 116.454659, lat: 39.934086 },
  { id: '7', name: '国贸商城', category: '购物', icon: '🏬', lng: 116.461734, lat: 39.909187 },
  { id: '8', name: '星巴克臻选', category: '饮品', icon: '☕', lng: 116.447526, lat: 39.921489 },
  { id: '9', name: '北京饭店', category: '住宿', icon: '🛏️', lng: 116.410031, lat: 39.909187 },
  { id: '10', name: '北京南站', category: '景点', icon: '🚄', lng: 116.378517, lat: 39.865246 },
]

export const DEFAULT_CENTER: [number, number] = [116.397428, 39.90923]
