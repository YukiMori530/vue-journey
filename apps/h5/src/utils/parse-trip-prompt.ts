export interface ParsedTripPrompt {
  destination: string
  days: number
  raw: string
  fullPrompt: string
  preferences: string[]
}

const CITY_PATTERN =
  /(平潭岛|平潭|福州|武夷山|黄山|泰山|峨眉山|乐山|九寨沟|贵阳|拉萨|洛阳|扬州|无锡|宁波|绍兴|乌镇|舟山|威海|济南|长白山|青海湖|张掖|华山|武当山|恩施|宜昌|婺源|景德镇|庐山|西双版纳|腾冲|香格里拉|北海|潮州|珠海|泉州|成都|烟台|北京|上海|海南|杭州|西安|重庆|厦门|大理|丽江|青岛|苏州|南京|广州|深圳|武汉|长沙|三亚|三明|南昌|敦煌|秦皇岛|承德|石家庄|保定|张家口|唐山|桂林|哈尔滨|张家界|天津|昆明|新干|吉安)/

const PLAN_PREFIX_RE =
  /^(?:帮我|请帮我|帮忙|我想|我要)?(?:规划|制定|安排|去|到)/

const ISLAND_TO_REGION: Record<string, string> = {
  平潭岛: '平潭',
  嵛山岛: '福鼎',
  鼓浪屿: '厦门',
}

const THEME_RULES: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /蓝眼泪|追泪|荧光海/, label: '蓝眼泪' },
  { pattern: /啤酒|哈啤|鲜啤|精酿|原浆/, label: '啤酒体验' },
  { pattern: /海鲜|海产品|渔港|吃海|痛风/, label: '海鲜美食' },
  { pattern: /美食|逛吃|小吃|夜市|烧烤|火锅/, label: '美食探店' },
  { pattern: /亲子|带娃|儿童/, label: '亲子友好' },
  { pattern: /拍照|打卡|网红/, label: '拍照打卡' },
  { pattern: /徒步|登山|户外/, label: '户外徒步' },
  { pattern: /看海|海滩|沙滩|滨海|环岛/, label: '滨海休闲' },
  { pattern: /人文|历史|博物馆|古镇/, label: '人文历史' },
]

function normalizeDestinationName(name: string): string {
  const trimmed = name.trim()
  if (ISLAND_TO_REGION[trimmed]) {
    return ISLAND_TO_REGION[trimmed]
  }
  if (/平潭岛/.test(trimmed)) {
    return '平潭'
  }
  return trimmed.replace(/(市|县|区|省)$/, '').slice(0, 20)
}

function extractDestination(text: string): string {
  let core = text.trim()
  core = core.replace(PLAN_PREFIX_RE, '')
  core = core.replace(/\d+\s*[天日](?:游|行程|之旅)?/g, ' ')
  core = core.replace(/(?:的)?(?:旅行|旅游|自由行)?(?:行程|路线|计划|攻略)/g, ' ')
  core = core.replace(/[，,。！!？?\s]+/g, ' ')
  core = core.trim()

  const islandMatch = core.match(/([\u4e00-\u9fa5]{2,8}岛)/)
  if (islandMatch) {
    return normalizeDestinationName(islandMatch[1])
  }

  const cityMatch = core.match(CITY_PATTERN)
  if (cityMatch) {
    return normalizeDestinationName(cityMatch[1])
  }

  const fallback = core.replace(/\d+\s*[天日].*/, '').trim()
  return normalizeDestinationName(fallback || core.slice(0, 20))
}

function extractPreferences(text: string, destination: string): string[] {
  const prefs = new Set<string>()

  THEME_RULES.forEach(({ pattern, label }) => {
    if (pattern.test(text)) {
      prefs.add(label)
    }
  })

  let remain = text
    .replace(/\d+\s*[天日](?:游|行程)?/g, '')
    .replace(new RegExp(destination, 'g'), '')
    .replace(/平潭岛|平潭/g, '')
    .replace(/帮我规划|规划|的行程|三日游|二日游|一日游|游/g, '')
    .replace(/[，,。！!？?\s]+/g, '')
    .trim()

  if (remain.length >= 2 && remain.length <= 24) {
    prefs.add(remain)
  }

  return [...prefs]
}

export function parseTripPrompt(text: string, fixedDays?: number | null): ParsedTripPrompt {
  const trimmed = text.trim()
  const daysMatch = trimmed.match(/(\d+)\s*[天日]/)
  const destination = extractDestination(trimmed)
  const days = fixedDays ?? (daysMatch ? Number(daysMatch[1]) : 3)
  const preferences = extractPreferences(trimmed, destination)

  return {
    destination,
    days,
    raw: trimmed,
    fullPrompt: `帮我规划${trimmed}的行程`,
    preferences,
  }
}
