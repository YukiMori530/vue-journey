export type PoiCategory = '景点' | '美食' | '饮品' | '购物' | '住宿'

export interface ExplorePoi {
  id: string
  name: string
  category: PoiCategory
  icon: string
  lng: number
  lat: number
}

export interface ExploreCity {
  id: string
  name: string
  center: [number, number]
  weather: string
  pois: ExplorePoi[]
}

/** 按城市组织的 POI，后续可接高德 Place Search / 后端接口 */
export const exploreCities: ExploreCity[] = [
  {
    id: 'beijing',
    name: '北京市',
    center: [116.397428, 39.90923],
    weather: '⛈ 雷暴 16° - 27°',
    pois: [
      { id: 'bj-1', name: '故宫博物院', category: '景点', icon: '🏛️', lng: 116.397026, lat: 39.918058 },
      { id: 'bj-2', name: '颐和园', category: '景点', icon: '🌳', lng: 116.275179, lat: 39.999617 },
      { id: 'bj-3', name: '国家体育场', category: '景点', icon: '🎭', lng: 116.396574, lat: 39.992806 },
      { id: 'bj-4', name: '南锣鼓巷', category: '美食', icon: '🍜', lng: 116.403874, lat: 39.936316 },
      { id: 'bj-5', name: '簋街', category: '美食', icon: '🦞', lng: 116.424089, lat: 39.941462 },
      { id: 'bj-6', name: '三里屯太古里', category: '购物', icon: '🛍️', lng: 116.454659, lat: 39.934086 },
      { id: 'bj-7', name: '国贸商城', category: '购物', icon: '🏬', lng: 116.461734, lat: 39.909187 },
      { id: 'bj-8', name: '星巴克臻选', category: '饮品', icon: '☕', lng: 116.447526, lat: 39.921489 },
      { id: 'bj-9', name: '北京饭店', category: '住宿', icon: '🛏️', lng: 116.410031, lat: 39.909187 },
    ],
  },
  {
    id: 'chengdu',
    name: '成都市',
    center: [104.066541, 30.572269],
    weather: '☁ 多云 18° - 26°',
    pois: [
      { id: 'cd-1', name: '宽窄巷子', category: '景点', icon: '🏮', lng: 104.053989, lat: 30.663791 },
      { id: 'cd-2', name: '锦里古街', category: '景点', icon: '🏛️', lng: 104.048492, lat: 30.645994 },
      { id: 'cd-3', name: '武侯祠', category: '景点', icon: '🌳', lng: 104.049675, lat: 30.646994 },
      { id: 'cd-4', name: '春熙路', category: '购物', icon: '🛍️', lng: 104.081534, lat: 30.657689 },
      { id: 'cd-5', name: '建设路小吃街', category: '美食', icon: '🌶️', lng: 104.101234, lat: 30.670123 },
      { id: 'cd-6', name: '玉林路小酒馆', category: '饮品', icon: '🍺', lng: 104.043567, lat: 30.631234 },
      { id: 'cd-7', name: '太古里', category: '购物', icon: '🏬', lng: 104.085678, lat: 30.653456 },
      { id: 'cd-8', name: '香格里拉酒店', category: '住宿', icon: '🛏️', lng: 104.066789, lat: 30.654567 },
    ],
  },
  {
    id: 'yantai',
    name: '烟台市',
    center: [121.447935, 37.463822],
    weather: '🌤 晴 15° - 24°',
    pois: [
      { id: 'yt-1', name: '蓬莱阁', category: '景点', icon: '🏯', lng: 120.758789, lat: 37.823456 },
      { id: 'yt-2', name: '烟台山', category: '景点', icon: '🌳', lng: 121.401234, lat: 37.545678 },
      { id: 'yt-3', name: '养马岛', category: '景点', icon: '🏝️', lng: 121.618765, lat: 37.456789 },
      { id: 'yt-4', name: '所城里', category: '美食', icon: '🦐', lng: 121.448901, lat: 37.468901 },
      { id: 'yt-5', name: '金沙滩', category: '景点', icon: '🏖️', lng: 121.256789, lat: 37.389012 },
      { id: 'yt-6', name: '万象汇', category: '购物', icon: '🛍️', lng: 121.389012, lat: 37.512345 },
      { id: 'yt-7', name: '海边咖啡', category: '饮品', icon: '☕', lng: 121.412345, lat: 37.534567 },
      { id: 'yt-8', name: '烟台中心大酒店', category: '住宿', icon: '🛏️', lng: 121.445678, lat: 37.461234 },
    ],
  },
  {
    id: 'shanghai',
    name: '上海市',
    center: [121.473701, 31.230416],
    weather: '🌧 小雨 20° - 28°',
    pois: [
      { id: 'sh-1', name: '外滩', category: '景点', icon: '🌃', lng: 121.490317, lat: 31.241701 },
      { id: 'sh-2', name: '东方明珠', category: '景点', icon: '🗼', lng: 121.499718, lat: 31.239703 },
      { id: 'sh-3', name: '豫园', category: '景点', icon: '🏛️', lng: 121.492789, lat: 31.227234 },
      { id: 'sh-4', name: '南京路步行街', category: '购物', icon: '🛍️', lng: 121.475789, lat: 31.234567 },
      { id: 'sh-5', name: '城隍庙小吃', category: '美食', icon: '🥟', lng: 121.493456, lat: 31.226789 },
      { id: 'sh-6', name: '新天地', category: '饮品', icon: '☕', lng: 121.475123, lat: 31.220456 },
      { id: 'sh-7', name: '陆家嘴', category: '购物', icon: '🏬', lng: 121.505678, lat: 31.238901 },
      { id: 'sh-8', name: '和平饭店', category: '住宿', icon: '🛏️', lng: 121.489012, lat: 31.240123 },
    ],
  },
]

export function getCityById(id: string) {
  return exploreCities.find((city) => city.id === id) ?? exploreCities[0]
}
