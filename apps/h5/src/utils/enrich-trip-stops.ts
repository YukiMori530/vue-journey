import type { DayPlan, TripStop } from '../types/trip'

const CATEGORY_LABEL: Record<string, string> = {
  sight: '景点',
  food: '美食',
  hotel: '住宿',
  transport: '交通',
  景点: '景点',
  美食: '美食',
}

const DAY_THEMES = ['文化探源', '城市慢游', '自然休闲', '美食打卡', '深度漫步']

export function getDayTheme(day: number, destination: string): string {
  const theme = DAY_THEMES[(day - 1) % DAY_THEMES.length]
  return `DAY ${day} ${destination}${theme}`
}

export function enrichStop(stop: TripStop, index: number, destination: string): TripStop {
  const startHour = 9 + index * 2
  const endHour = startHour + 1
  const endMin = index % 2 === 0 ? 30 : 0

  return {
    ...stop,
    startTime: stop.startTime ?? `${String(startHour).padStart(2, '0')}:00`,
    endTime: stop.endTime ?? `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`,
    description:
      stop.description ??
      stop.tips ??
      `${stop.name}是当地值得停留的一站，建议预留 ${stop.duration ?? 90} 分钟慢慢体验。`,
    categoryLabel: stop.categoryLabel ?? CATEGORY_LABEL[stop.category ?? 'sight'] ?? '景点',
  }
}

export function enrichDayPlan(day: DayPlan, destination: string) {
  const places = day.places.map((raw, index) => {
    const base = typeof raw === 'string' ? { name: raw } : raw
    return enrichStop(base, index, destination)
  })

  return {
    day: day.day,
    title: day.title ?? getDayTheme(day.day, destination),
    places,
  }
}
