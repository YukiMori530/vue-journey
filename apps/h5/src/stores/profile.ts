import { defineStore } from 'pinia'

export const useProfileStore = defineStore('profile', {
  state: () => ({
    residence: '',
    avatarUrl: '/covers/default.jpg',
  }),

  actions: {
    setResidence(value: string) {
      this.residence = value
    },

    setAvatar(url: string) {
      this.avatarUrl = url
    },
  },

  persist: {
    key: 'tuhui-profile',
    pick: ['residence', 'avatarUrl'],
  },
})
