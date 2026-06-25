/** 与 server notes.service citySlug 保持一致 */
export const DESTINATION_TO_SLUG: Record<string, string> = {
  北京: 'beijing',
  上海: 'shanghai',
  成都: 'chengdu',
  杭州: 'hangzhou',
  西安: 'xian',
  厦门: 'xiamen',
  青岛: 'qingdao',
  重庆: 'chongqing',
  广州: 'guangzhou',
  南京: 'nanjing',
  苏州: 'suzhou',
  武汉: 'wuhan',
  长沙: 'changsha',
  南昌: 'nanchang',
  昆明: 'kunming',
  三亚: 'sanya',
  丽江: 'lijiang',
  大理: 'dali',
  桂林: 'guilin',
  深圳: 'shenzhen',
  哈尔滨: 'harbin',
  张家界: 'zhangjiajie',
  敦煌: 'dunhuang',
  烟台: 'yantai',
  天津: 'tianjin',
  保定: 'baoding',
  福州: 'fuzhou',
  平潭: 'pingtan',
}

const SLUG_TO_DEST = Object.fromEntries(
  Object.entries(DESTINATION_TO_SLUG).map(([dest, slug]) => [slug, dest]),
) as Record<string, string>

export function normalizeDestinationName(name: string): string {
  return name.replace(/(市|县|区|省)$/, '').trim()
}

export function citySlugFromDestination(destination: string): string {
  const key = normalizeDestinationName(destination)
  return DESTINATION_TO_SLUG[key] ?? key.toLowerCase().replace(/\s+/g, '-')
}

export function resolveDestinationFromCitySlug(slug: string): string {
  const normalized = slug.trim().toLowerCase()
  if (SLUG_TO_DEST[normalized]) {
    return SLUG_TO_DEST[normalized]
  }
  return normalized.replace(/-/g, '')
}

export function destinationDisplayName(destination: string): string {
  const base = normalizeDestinationName(destination)
  if (!base) {
    return destination
  }
  return destination.includes('市') ? destination : `${base}市`
}
