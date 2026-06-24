import type { DayPlan, Trip } from '../types/trip'
import { isRemoteExcursion } from './geo-distance'

const CN_DAY: Record<string, number> = {
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10,
}

function placeNames(day: DayPlan): string[] {
  return day.places.map((place) => (typeof place === 'string' ? place : place.name))
}

function dayPlaceKey(day: DayPlan): string {
  return [...placeNames(day)].sort().join('|')
}

function parseDayFromMessage(message: string, maxDays: number): number | null {
  const digitMatch = message.match(/第\s*(\d+)\s*天/)
  if (digitMatch) {
    const day = Number(digitMatch[1])
    return day >= 1 && day <= maxDays ? day : null
  }

  const cnMatch = message.match(/第\s*([一二三四五六七八九十]+)\s*天/)
  if (cnMatch) {
    const day = CN_DAY[cnMatch[1]]
    return day != null && day <= maxDays ? day : null
  }

  const dayTagMatch = message.match(/DAY\s*(\d+)/i)
  if (dayTagMatch) {
    const day = Number(dayTagMatch[1])
    return day >= 1 && day <= maxDays ? day : null
  }

  return null
}

function findRemoteDay(trip: Trip): number | null {
  const remoteDay = trip.dayPlans.find((day) =>
    placeNames(day).some((name) => isRemoteExcursion(name)),
  )
  return remoteDay?.day ?? null
}

function findMostChangedDay(beforePlans: DayPlan[], afterTrip: Trip): number | null {
  let focusDay: number | null = null
  let maxScore = 0

  for (const afterDay of afterTrip.dayPlans) {
    const beforeDay = beforePlans.find((day) => day.day === afterDay.day)
    const beforeKey = beforeDay ? dayPlaceKey(beforeDay) : ''
    const afterKey = dayPlaceKey(afterDay)
    if (beforeKey === afterKey) {
      continue
    }

    const beforeCount = beforeDay?.places.length ?? 0
    const afterCount = afterDay.places.length
    const score = Math.abs(afterCount - beforeCount) + (beforeKey !== afterKey ? 2 : 0)
    if (score >= maxScore) {
      maxScore = score
      focusDay = afterDay.day
    }
  }

  return focusDay
}

export function pickRevisionFocusDay(
  beforePlans: DayPlan[],
  afterTrip: Trip,
  message: string,
): number {
  const maxDays = afterTrip.dayPlans.length || afterTrip.days

  const explicitDay = parseDayFromMessage(message, maxDays)
  if (explicitDay != null) {
    return explicitDay
  }

  if (/长城|八达岭|慕田峪|远郊|单独/.test(message)) {
    const remoteDay = findRemoteDay(afterTrip)
    if (remoteDay != null) {
      return remoteDay
    }
  }

  const changedDay = findMostChangedDay(beforePlans, afterTrip)
  if (changedDay != null) {
    return changedDay
  }

  return afterTrip.dayPlans.at(-1)?.day ?? 1
}
