import type { DayPlan } from '../types/trip'

const DAY_HEADER = /第\s*([0-9一二三四五六七八九十]+)\s*天/i
const BULLET = /^[\s\-·•*\d+.、)）]+/

const CITY_HINTS = ['北京', '上海', '成都', '杭州', '烟台', '南昌', '林芝', '昆明', '伊宁', '香港']

export interface ParsedGuide {
  destination: string
  days: number
  dayPlans: DayPlan[]
}

function normalizeDay(raw: string): number {
  const map: Record<string, number> = {
    一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10,
  }
  if (/^\d+$/.test(raw)) {
    return Number(raw)
  }
  return map[raw] ?? 1
}

function guessDestination(text: string, places: string[]): string {
  for (const city of CITY_HINTS) {
    if (text.includes(city)) {
      return city
    }
  }
  const first = places[0] ?? '旅行'
  return first.slice(0, 2)
}

function chunkPlaces(places: string[]): DayPlan[] {
  const perDay = 3
  const days = Math.max(1, Math.ceil(places.length / perDay))
  return Array.from({ length: days }, (_, index) => {
    const day = index + 1
    const start = index * perDay
    return {
      day,
      places: places.slice(start, start + perDay),
    }
  })
}

export function parseGuideText(text: string): ParsedGuide {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const dayPlans: DayPlan[] = []
  let currentDay = 0
  const flatPlaces: string[] = []

  for (const line of lines) {
    const dayMatch = line.match(DAY_HEADER)
    if (dayMatch) {
      currentDay = normalizeDay(dayMatch[1])
      if (!dayPlans.find((item) => item.day === currentDay)) {
        dayPlans.push({ day: currentDay, places: [] })
      }
      continue
    }

    const place = line.replace(BULLET, '').trim()
    if (!place || place.length < 2) {
      continue
    }

    flatPlaces.push(place)
    if (currentDay > 0) {
      const target = dayPlans.find((item) => item.day === currentDay)
      target?.places.push(place)
    }
  }

  const cleanedDayPlans = dayPlans.filter((item) => item.places.length > 0)
  const finalDayPlans =
    cleanedDayPlans.length > 0 ? cleanedDayPlans : chunkPlaces(flatPlaces)

  const destination = guessDestination(text, flatPlaces)
  const days = finalDayPlans.length || 1

  return {
    destination,
    days,
    dayPlans: finalDayPlans.length
      ? finalDayPlans
      : [{ day: 1, places: ['待添加地点'] }],
  }
}

export function parseDaysFromDuration(duration: string): number {
  const match = duration.match(/(\d+)\s*天/)
  return match ? Number(match[1]) : 3
}
