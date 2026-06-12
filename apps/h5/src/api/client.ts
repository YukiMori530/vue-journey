import { getStoredToken } from '../types/auth'

interface ApiResponse<T> {
  data: T
  message: string
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken()
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
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

  const json = (await response.json()) as ApiResponse<T>
  return json.data
}
