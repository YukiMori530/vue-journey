import { defineStore } from 'pinia'
import * as aiApi from '../api/ai'
import * as tripsApi from '../api/trips'
import type { HotTrip, FeaturedTopic } from '../data/discover'
import type { CreateTripInput, DayPlan, Trip } from '../types/trip'
import { parseDaysFromDuration } from '../utils/parse-guide'
import { pickTripTheme } from '../utils/trip-themes'

const PLACE_TEMPLATES = [
  '中心广场',
  '特色步行街',
  '本地美食街',
  '城市公园',
  '博物馆',
  '网红咖啡店',
  '观景平台',
  '古街片区',
]

function mockDayPlans(destination: string, days: number): DayPlan[] {
  return Array.from({ length: days }, (_, index) => {
    const day = index + 1
    const count = 2 + (day % 3)
    const places = Array.from({ length: count }, (_, placeIndex) => {
      const template = PLACE_TEMPLATES[(day + placeIndex) % PLACE_TEMPLATES.length]
      return `${destination}${template}`
    })
    return { day, places }
  })
}

function upsertTrip(trips: Trip[], trip: Trip) {
  const index = trips.findIndex((item) => item.id === trip.id)
  if (index >= 0) {
    trips[index] = trip
    return
  }
  trips.unshift(trip)
}

export const useTripStore = defineStore('trip', {
  state: () => ({
    trips: [] as Trip[],
    loading: false,
    loaded: false,
  }),

  getters: {
    tripById: (state) => {
      return (id: number) => state.trips.find((trip) => trip.id === id)
    },
  },

  actions: {
    async fetchTrips() {
      this.loading = true
      try {
        this.trips = await tripsApi.fetchTrips()
        this.loaded = true
      } finally {
        this.loading = false
      }
    },

    async fetchTripById(id: number) {
      const existing = this.tripById(id)
      if (existing) {
        return existing
      }

      const trip = await tripsApi.fetchTrip(id)
      upsertTrip(this.trips, trip)
      return trip
    },

    async addTrip(input: CreateTripInput, onLog?: (log: aiApi.PlanStreamLog) => void) {
      const trip = onLog
        ? await aiApi.planTripStream(input, onLog, (text) => {
            onLog({ kind: 'location', text })
          })
        : await aiApi.planTrip(input)
      upsertTrip(this.trips, trip)
      return trip
    },

    async addEmptyTrip() {
      const count = this.trips.length
      const theme = pickTripTheme(count).bg
      const trip = await tripsApi.createTrip({
        destination: '待规划',
        days: 0,
        preferences: [],
        title: '新计划旅游',
        nights: '未设置日期',
        placeCount: 0,
        cover: '/covers/default.jpg',
        theme,
        dayPlans: [],
      })
      upsertTrip(this.trips, trip)
      return trip
    },

    async addTripFromText(text: string) {
      const trip = await aiApi.importGuide(text)
      upsertTrip(this.trips, trip)
      return trip
    },

    async addTripFromHotTrip(item: HotTrip) {
      const days = parseDaysFromDuration(item.duration)
      const destination = item.keywords[0] ?? '热门'
      const dayPlans = mockDayPlans(destination, days).map((day, index) => ({
        ...day,
        places: day.places.map((_place, placeIndex) => {
          const keyword = item.keywords[(index + placeIndex) % item.keywords.length]
          return `${destination}·${keyword}${placeIndex + 1}号点`
        }),
      }))

      const trip = await tripsApi.createTrip({
        destination,
        days,
        preferences: item.keywords.slice(1, 3),
        title: item.title,
        nights: item.duration.replace(/\s*·.*/, '').trim(),
        placeCount: item.placeCount,
        cover: item.cover,
        theme: pickTripTheme(item.id).bg,
        dayPlans,
      })
      upsertTrip(this.trips, trip)
      return trip
    },

    async addTripFromTopic(item: FeaturedTopic) {
      const days = Math.max(1, Math.min(3, Math.ceil(item.placeCount / 4)))
      const destination = item.keywords[0] ?? '专题'
      const dayPlans = mockDayPlans(destination, days)

      const trip = await tripsApi.createTrip({
        destination,
        days,
        preferences: item.keywords,
        title: item.title,
        nights: `${days}天${Math.max(days - 1, 0)}晚`,
        placeCount: item.placeCount,
        cover: item.cover,
        theme: pickTripTheme(item.id + 2).bg,
        dayPlans,
      })
      upsertTrip(this.trips, trip)
      return trip
    },

    async removeTrip(id: number) {
      await tripsApi.deleteTrip(id)
      this.trips = this.trips.filter((trip) => trip.id !== id)
    },
  },
})
