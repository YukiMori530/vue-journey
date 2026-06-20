export interface ParsedTripPrompt {
  destination: string
  days: number
  raw: string
  fullPrompt: string
}

export function parseTripPrompt(text: string, fixedDays?: number | null): ParsedTripPrompt {
  const trimmed = text.trim()
  const daysMatch = trimmed.match(/(\d+)\s*[天日]/)
  const cityMatch = trimmed.match(
    /(成都|烟台|北京|上海|海南|杭州|西安|重庆|厦门|大理|丽江|青岛|苏州|南京|广州|深圳|武汉|长沙|三亚|三明|新干|南昌|吉安|敦煌)/,
  )

  let destination = cityMatch?.[1] ?? trimmed.replace(/\d+\s*[天日].*/, '').trim()
  if (!destination) {
    destination = trimmed.split(/[，,。！!？?\s]/)[0] ?? trimmed
  }
  destination = destination.slice(0, 20)

  const days = fixedDays ?? (daysMatch ? Number(daysMatch[1]) : 3)

  return {
    destination,
    days,
    raw: trimmed,
    fullPrompt: `帮我规划${trimmed}的行程`,
  }
}
