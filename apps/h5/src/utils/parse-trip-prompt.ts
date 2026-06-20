export interface ParsedTripPrompt {
  destination: string
  days: number
  raw: string
  fullPrompt: string
  preferences: string[]
}

const CITY_PATTERN =
  /(成都|烟台|北京|上海|海南|杭州|西安|重庆|厦门|大理|丽江|青岛|苏州|南京|广州|深圳|武汉|长沙|三亚|三明|新干|南昌|吉安|敦煌)/

const THEME_RULES: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /啤酒|哈啤|鲜啤|精酿|原浆/, label: '啤酒体验' },
  { pattern: /海鲜|海产品|渔港|吃海|痛风/, label: '海鲜美食' },
  { pattern: /美食|逛吃|小吃|夜市|烧烤|火锅/, label: '美食探店' },
  { pattern: /亲子|带娃|儿童/, label: '亲子友好' },
  { pattern: /拍照|打卡|网红/, label: '拍照打卡' },
  { pattern: /徒步|登山|户外/, label: '户外徒步' },
  { pattern: /看海|海滩|沙滩|滨海/, label: '滨海休闲' },
  { pattern: /人文|历史|博物馆|古镇/, label: '人文历史' },
]

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
  const cityMatch = trimmed.match(CITY_PATTERN)

  let destination = cityMatch?.[1] ?? trimmed.replace(/\d+\s*[天日].*/, '').trim()
  if (!destination) {
    destination = trimmed.split(/[，,。！!？?\s]/)[0] ?? trimmed
  }
  destination = destination.slice(0, 20)

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
