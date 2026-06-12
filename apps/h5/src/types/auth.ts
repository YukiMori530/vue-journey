export interface AuthUser {
  id: number
  email: string
  nickname: string
}

export interface AuthPayload {
  token: string
  user: AuthUser
}

export const AUTH_STORAGE_KEY = 'tuhui-auth'

export function getStoredToken(): string {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) {
      return ''
    }
    const parsed = JSON.parse(raw) as { token?: string }
    return parsed.token ?? ''
  } catch {
    return ''
  }
}
