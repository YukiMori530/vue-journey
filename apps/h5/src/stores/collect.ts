import { defineStore } from 'pinia'
import {
  COLLECT_STORAGE_KEY,
  DEFAULT_GROUPS,
  type CollectGroup,
  type CollectItem,
} from '../types/collect'

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const useCollectStore = defineStore('collect', {
  state: () => ({
    items: [] as CollectItem[],
    groups: [...DEFAULT_GROUPS] as CollectGroup[],
  }),

  getters: {
    count: (state) => state.items.length,
    cityCount: (state) => {
      const cities = new Set(state.items.map((item) => item.locationName))
      return cities.size
    },
    itemsByGroup: (state) => (groupId: string) =>
      state.items.filter((item) => item.groupId === groupId),
    groupCount: (state) => (groupId: string) =>
      state.items.filter((item) => item.groupId === groupId).length,
  },

  actions: {
    addItem(payload: Omit<CollectItem, 'id' | 'createdAt' | 'groupId'> & { groupId?: string }) {
      const item: CollectItem = {
        id: createId(),
        groupId: payload.groupId ?? 'favorite',
        createdAt: new Date().toISOString(),
        photo: payload.photo,
        locationName: payload.locationName,
        lng: payload.lng,
        lat: payload.lat,
      }
      this.items.unshift(item)
      return item
    },

    removeItem(id: string) {
      this.items = this.items.filter((item) => item.id !== id)
    },
  },

  persist: {
    key: COLLECT_STORAGE_KEY,
    pick: ['items', 'groups'],
  },
})
