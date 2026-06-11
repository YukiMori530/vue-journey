import { defineStore } from 'pinia'
import * as tripsApi from '../api/trips'
import type { HotTrip, FeaturedTopic } from '../data/discover'
import type { CreateTripInput, DayPlan, Trip } from '../types/trip'
import { parseDaysFromDuration } from '../utils/parse-guide'

const THEMES = [
  'linear-gradient(135deg, #d4ede8 0%, #c5e8e0 100%)',
  'linear-gradient(135deg, #fdebd3 0%, #f9dcc4 100%)',
  'linear-gradient(135deg, #e8eef9 0%, #d6e4ff 100%)',
  'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
]

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

    async addTrip(input: CreateTripInput) {
      const trip = await tripsApi.createTrip(input)
      upsertTrip(this.trips, trip)
      return trip
    },

    async addTripFromText(text: string) {
      const trip = await tripsApi.importTrip(text)
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
        theme: THEMES[item.id % THEMES.length],
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
        theme: THEMES[(item.id + 2) % THEMES.length],
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
