import { defineStore } from 'pinia'
import type { CreateTripInput, DayPlan, Trip } from '../types/trip'

const THEMES = [
  'linear-gradient(135deg, #d4ede8 0%, #c5e8e0 100%)',
  'linear-gradient(135deg, #fdebd3 0%, #f9dcc4 100%)',
  'linear-gradient(135deg, #e8eef9 0%, #d6e4ff 100%)',
  'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
]

const COVERS = [
  'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&q=80',
  'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&q=80',
  'https://images.unsplash.com/photo-1508804185872-d83badad00f2?w=400&q=80',
  'https://images.unsplash.com/photo-1547981609-4c6a41de1593?w=400&q=80',
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

function buildTitle(destination: string, days: number, preferences: string[]) {
  const pref = preferences[0]
  if (pref) {
    return `${destination}${days}日${pref}之旅`
  }
  return `${destination}${days}日游`
}

const seedTrips: Trip[] = [
  {
    id: 1,
    destination: '烟台',
    days: 3,
    preferences: ['自然风光'],
    title: '烟台三日海韵慢行',
    nights: '3天2晚',
    placeCount: 13,
    cover: COVERS[0],
    theme: THEMES[0],
    dayPlans: mockDayPlans('烟台', 3),
  },
  {
    id: 2,
    destination: '成都',
    days: 2,
    preferences: ['美食'],
    title: '成都美食周末游',
    nights: '2天1晚',
    placeCount: 8,
    cover: COVERS[1],
    theme: THEMES[1],
    dayPlans: mockDayPlans('成都', 2),
  },
]

export const useTripStore = defineStore('trip', {
  state: () => ({
    trips: seedTrips as Trip[],
    nextId: 3,
  }),

  getters: {
    tripById: (state) => {
      return (id: number) => state.trips.find((trip) => trip.id === id)
    },
  },

  actions: {
    addTrip(input: CreateTripInput) {
      const dayPlans = mockDayPlans(input.destination, input.days)
      const placeCount = dayPlans.reduce((sum, day) => sum + day.places.length, 0)
      const trip: Trip = {
        id: this.nextId++,
        destination: input.destination,
        days: input.days,
        preferences: input.preferences,
        title: buildTitle(input.destination, input.days, input.preferences),
        nights: `${input.days}天${Math.max(input.days - 1, 0)}晚`,
        placeCount,
        cover: COVERS[this.nextId % COVERS.length],
        theme: THEMES[this.nextId % THEMES.length],
        dayPlans,
      }
      this.trips.unshift(trip)
      return trip
    },

    removeTrip(id: number) {
      this.trips = this.trips.filter((trip) => trip.id !== id)
    },
  },

  persist: {
    key: 'vue-journey-trips',
    pick: ['trips', 'nextId'],
  },
})
