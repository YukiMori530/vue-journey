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
  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new ApiError('网络异常，请确认后端已启动且可访问', 0)
  }

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

/** 失败时返回 null，不抛错（避免控制台堆栈；502 等多为后端热重载） */
export async function requestOptional<T>(
  path: string,
  options: RequestInit = {},
): Promise<T | null> {
  try {
    return await request<T>(path, options)
  } catch {
    return null
  }
}
