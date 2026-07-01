import { request, ApiError } from './client'
import { getStoredToken } from '../types/auth'
import type { CreateTripInput, Trip } from '../types/trip'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

export type PlanStreamLog = {
  kind: string
  text: string
}

export function planTrip(input: CreateTripInput) {
  return request<Trip>('/api/ai/plan', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function planTripStream(
  input: CreateTripInput,
  onLog: (log: PlanStreamLog) => void,
  onStatus?: (text: string) => void,
): Promise<Trip> {
  const token = getStoredToken()
  const response = await fetch(`${API_BASE}/api/ai/plan/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { message?: string | string[] }
      | null
    const message = Array.isArray(body?.message)
      ? body.message.join('；')
      : body?.message ?? `请求失败（${response.status}）`
    throw new ApiError(message, response.status)
  }

  if (!response.body) {
    throw new ApiError('规划流响应为空', 500)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let trip: Trip | null = null

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.trim()) {
        continue
      }

      const event = JSON.parse(line) as {
        type: string
        kind?: string
        text?: string
        message?: string
        data?: Trip
      }

      if (event.type === 'log' && event.kind && event.text) {
        onLog({ kind: event.kind, text: event.text })
      } else if (event.type === 'status' && event.text) {
        onStatus?.(event.text)
      } else if (event.type === 'done' && event.data) {
        trip = event.data
      } else if (event.type === 'error') {
        throw new ApiError(event.message ?? '规划失败', 500)
      }
    }
  }

  if (!trip) {
    throw new ApiError('规划未完成', 500)
  }

  return trip
}

export function importGuide(text: string) {
  return request<Trip>('/api/ai/import', {
    method: 'POST',
    body: JSON.stringify({ text }),
  })
}

export async function reviseTripStream(
  tripId: number,
  message: string,
  onLog?: (log: PlanStreamLog) => void,
): Promise<Trip> {
  const token = getStoredToken()
  const response = await fetch(`${API_BASE}/api/ai/revise/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ tripId, message }),
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { message?: string | string[] }
      | null
    const msg = Array.isArray(body?.message)
      ? body.message.join('；')
      : body?.message ?? `请求失败（${response.status}）`
    throw new ApiError(msg, response.status)
  }

  if (!response.body) {
    throw new ApiError('修改流响应为空', 500)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let trip: Trip | null = null

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.trim()) {
        continue
      }

      const event = JSON.parse(line) as {
        type: string
        kind?: string
        text?: string
        message?: string
        data?: Trip
      }

      if (event.type === 'log' && event.kind && event.text) {
        onLog?.({ kind: event.kind, text: event.text })
      } else if (event.type === 'done' && event.data) {
        trip = event.data
      } else if (event.type === 'error') {
        throw new ApiError(event.message ?? '修改失败', 500)
      }
    }
  }

  if (!trip) {
    throw new ApiError('修改未完成', 500)
  }

  return trip
}

export function chatTrip(tripId: number, message: string) {
  return request<{ reply: string }>('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ tripId, message }),
  }).then((data) => data.reply)
}

export function chatAssistant(
  message: string,
  context?: { page?: string; hint?: string },
) {
  return request<{ reply: string }>('/api/ai/assistant', {
    method: 'POST',
    body: JSON.stringify({ message, context }),
  }).then((data) => data.reply)
}
