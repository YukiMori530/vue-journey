import { ApiError } from '../api/client'

export function formatActionError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return '请先登录后再操作'
    }
    if (error.status === 0) {
      return error.message
    }
    return error.message || fallback
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }
  return fallback
}
