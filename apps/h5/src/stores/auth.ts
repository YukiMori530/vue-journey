import { defineStore } from 'pinia'
import * as authApi from '../api/auth'
import { AUTH_STORAGE_KEY, type AuthUser } from '../types/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '' as string,
    user: null as AuthUser | null,
  }),

  getters: {
    isLoggedIn: (state) => Boolean(state.token && state.user),
    displayName: (state) => state.user?.nickname ?? '未登录',
  },

  actions: {
    async register(email: string, password: string, nickname: string) {
      const payload = await authApi.register({ email, password, nickname })
      this.token = payload.token
      this.user = payload.user
      return payload
    },

    async login(email: string, password: string) {
      const payload = await authApi.login({ email, password })
      this.token = payload.token
      this.user = payload.user
      return payload
    },

    async fetchProfile() {
      if (!this.token) {
        return null
      }
      const user = await authApi.fetchProfile()
      this.user = user
      return user
    },

    logout() {
      this.token = ''
      this.user = null
    },
  },

  persist: {
    key: AUTH_STORAGE_KEY,
    pick: ['token', 'user'],
  },
})
