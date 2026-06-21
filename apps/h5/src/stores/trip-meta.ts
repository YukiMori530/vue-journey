import { defineStore } from 'pinia'

interface PackItem {
  id: string
  text: string
  done: boolean
}

interface TripMetaRecord {
  note: string
  packItems: PackItem[]
}

const STORAGE_KEY = 'tuhui-trip-meta'

function readAll(): Record<string, TripMetaRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, TripMetaRecord>) : {}
  } catch {
    return {}
  }
}

function writeAll(data: Record<string, TripMetaRecord>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

const DEFAULT_PACK = ['身份证', '充电器', '换洗衣物', '常用药品']

export const useTripMetaStore = defineStore('tripMeta', {
  state: () => ({
    cache: readAll(),
  }),

  actions: {
    getMeta(tripId: number): TripMetaRecord {
      const key = String(tripId)
      if (!this.cache[key]) {
        this.cache[key] = {
          note: '',
          packItems: DEFAULT_PACK.map((text, index) => ({
            id: `default-${index}`,
            text,
            done: false,
          })),
        }
        writeAll(this.cache)
      }
      return this.cache[key]
    },

    saveNote(tripId: number, note: string) {
      const meta = this.getMeta(tripId)
      meta.note = note
      writeAll(this.cache)
    },

    togglePackItem(tripId: number, itemId: string) {
      const meta = this.getMeta(tripId)
      const item = meta.packItems.find((entry) => entry.id === itemId)
      if (item) {
        item.done = !item.done
        writeAll(this.cache)
      }
    },

    addPackItem(tripId: number, text: string) {
      const meta = this.getMeta(tripId)
      meta.packItems.push({
        id: `item-${Date.now()}`,
        text,
        done: false,
      })
      writeAll(this.cache)
    },

    packDoneCount(tripId: number) {
      const items = this.getMeta(tripId).packItems
      return items.filter((item) => item.done).length
    },
  },
})
