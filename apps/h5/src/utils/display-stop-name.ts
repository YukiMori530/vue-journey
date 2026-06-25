import { primaryPlaceName } from './place-photo'

const LEADING_CITY_RE =
  /^(?:[\u4e00-\u9fa5]{2,10}(?:市|县|区|省)|北京|上海|天津|重庆|广州|深圳|成都|杭州|西安|南京|武汉|昆明|平潭|福州|秦皇岛|承德|石家庄|北戴河|鼓浪屿)/

/** 列表/地图展示用：去掉重复城市前缀与「昆明·昆明1号点」类占位名 */
export function formatStopDisplayName(name: string, destination?: string): string {
  let result = primaryPlaceName(name).replace(/\s/g, '').trim()
  if (!result) {
    return name
  }

  const dest = destination?.replace(/(市|县|区|省)$/, '').trim()
  if (dest && dest !== '待规划') {
    if (result.startsWith(dest)) {
      result = result.slice(dest.length).replace(/^[·\s\-—]+/, '')
    }
    result = result.replace(new RegExp(`^${dest}(?:市|县|区)?`), '')
  }

  result = result.replace(LEADING_CITY_RE, '')
  result = result.replace(/^[\u4e00-\u9fa5]{2,8}[·•\s-]+(?=[\u4e00-\u9fa5])/, '')

  const dupMatch = result.match(/^([\u4e00-\u9fa5]{2,8})[·•]\1(.*)$/)
  if (dupMatch) {
    result = `${dupMatch[1]}${dupMatch[2]}`
  }

  return result.trim() || primaryPlaceName(name)
}
