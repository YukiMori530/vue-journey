import type { DayPlan, TripStop } from '../types/trip'
import { formatStopDisplayName } from './display-stop-name'

const CATEGORY_LABEL: Record<string, string> = {
  sight: '景点',
  food: '美食',
  hotel: '住宿',
  transport: '交通',
  景点: '景点',
  美食: '美食',
}

const DAY_THEMES = ['文化探源', '城市慢游', '自然休闲', '美食打卡', '深度漫步']

const CATEGORY_INTRO: Record<string, (name: string, destination: string, minutes: number) => string> = {
  sight: (name, destination, minutes) =>
    `${name}是${destination}代表性景点之一。建议预留约 ${minutes} 分钟，按开放时间与人流高峰合理安排到达顺序；若首次到访，可优先看核心展区和标志性视角，拍照与休息穿插进行会更轻松。`,
  food: (name, destination, minutes) =>
    `${name}在${destination}本地口碑不错，适合作为用餐或小吃打卡点。建议预留 ${minutes} 分钟左右，高峰时段可能排队；可先确认招牌菜与营业时间，搭配附近步行景点一起安排更顺路。`,
  hotel: (name, destination, _minutes) =>
    `${name}位于${destination}，可作为当日住宿落脚点。建议结合次日首站位置选择，入住前确认入住/退房时间与行李寄存；若行程较满，优先选交通便利、靠近次日动线的区域。`,
  transport: (_name, _destination, minutes) =>
    `本段为交通换乘节点，建议预留 ${minutes} 分钟用于进站、安检与换乘，并提前确认末班车或发车时间。`,
}

export function getDayTheme(day: number, destination: string): string {
  const theme = DAY_THEMES[(day - 1) % DAY_THEMES.length]
  return `DAY ${day} ${destination}${theme}`
}

export function enrichStop(stop: TripStop, index: number, destination: string): TripStop {
  const startHour = 9 + index * 2
  const endHour = startHour + 1
  const endMin = index % 2 === 0 ? 30 : 0
  const displayName = formatStopDisplayName(stop.name, destination)
  const minutes = stop.duration ?? 90
  const category = stop.category ?? 'sight'
  const fallbackIntro =
    CATEGORY_INTRO[category]?.(displayName, destination.replace(/(市|县|区)$/, ''), minutes) ??
    `${displayName}值得纳入${destination}行程。建议预留 ${minutes} 分钟，结合前后站点距离与开放时间灵活调整。`

  return {
    ...stop,
    startTime: stop.startTime ?? `${String(startHour).padStart(2, '0')}:00`,
    endTime: stop.endTime ?? `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`,
    description: stop.description?.trim() || stop.tips?.trim() || fallbackIntro,
    categoryLabel: stop.categoryLabel ?? CATEGORY_LABEL[category] ?? '景点',
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
