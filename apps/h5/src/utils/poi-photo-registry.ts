/** 本地精选景点图（北京等重点城市 demo 用） */
export const LOCAL_POI_PHOTOS: Array<{ keywords: string[]; path: string }> = [
  { keywords: ['天安门'], path: '/covers/pois/tiananmen.jpg' },
  { keywords: ['故宫', '紫禁城'], path: '/covers/pois/gugong.jpg' },
  { keywords: ['前门', '大栅栏'], path: '/covers/pois/qianmen.jpg' },
  { keywords: ['颐和园'], path: '/covers/pois/yiheyuan.jpg' },
  { keywords: ['圆明园'], path: '/covers/pois/yuanmingyuan.jpg' },
  { keywords: ['八达岭', '慕田峪', '长城'], path: '/covers/pois/badaling.jpg' },
  { keywords: ['天坛', '景山', '什刹海', '南锣鼓巷', '簋街', '护国寺', '王府井'], path: '/covers/pois/qianmen.jpg' },
]

/** 无 POI 图时按目的地兜底 */
export const DESTINATION_PHOTOS: Record<string, string> = {
  北京: '/covers/pois/tiananmen.jpg',
  上海: '/covers/pois/gugong.jpg',
  成都: '/covers/pois/qianmen.jpg',
  杭州: '/covers/pois/yiheyuan.jpg',
  西安: '/covers/pois/badaling.jpg',
  青岛: '/covers/pois/yiheyuan.jpg',
}

export const FOOD_PHOTO = '/covers/pois/qianmen.jpg'
export const FOOD_HINT_RE = /小吃|美食|餐厅|美食街|小吃街|步行街|夜市|胡同|簋街|王府井|田子坊|回民街|宽窄巷子|锦里|劈柴院|台东|八大局/

export function primaryPlaceName(name: string): string {
  return name
    .split(/[/|、·]/)[0]
    .replace(/[（(].*?[）)]/g, '')
    .trim()
}

function normalizeCity(destination: string): string {
  return destination.replace(/(市|县|区|省)$/, '').trim()
}

function matchesKeyword(name: string, keyword: string): boolean {
  const primary = primaryPlaceName(name)
  return primary.includes(keyword) || keyword.includes(primary)
}

export function lookupLocalPoiPhoto(name: string): string | undefined {
  const primary = primaryPlaceName(name)
  for (const item of LOCAL_POI_PHOTOS) {
    if (item.keywords.some((keyword) => matchesKeyword(primary, keyword))) {
      return item.path
    }
  }
  return undefined
}

export function lookupDestinationPhoto(destination: string): string | undefined {
  const city = normalizeCity(destination)
  return DESTINATION_PHOTOS[city]
}

export function lookupCategoryPhoto(name: string, category?: string): string | undefined {
  if (category === 'food' || category === '美食') {
    return FOOD_PHOTO
  }
  if (FOOD_HINT_RE.test(primaryPlaceName(name))) {
    return FOOD_PHOTO
  }
  return undefined
}
