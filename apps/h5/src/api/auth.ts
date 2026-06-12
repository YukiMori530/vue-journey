import { request } from './client'
import type { AuthPayload, AuthUser } from '../types/auth'

export function register(payload: {
  email: string
  password: string
  nickname: string
}) {
  return request<AuthPayload>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function login(payload: { email: string; password: string }) {
  return request<AuthPayload>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchProfile() {
  return request<AuthUser>('/api/auth/me')
}
