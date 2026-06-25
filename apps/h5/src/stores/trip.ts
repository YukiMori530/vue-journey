import { defineStore } from 'pinia'
import * as aiApi from '../api/ai'
import * as tripsApi from '../api/trips'
import * as notesApi from '../api/notes'
import type { HotTrip, FeaturedTopic } from '../data/discover'
import type { CreateTripInput, DayPlan, Trip } from '../types/trip'
import type { XhsNote } from '../api/notes'
import { parseDaysFromDuration, parseGuideText } from '../utils/parse-guide'
import { pickTripTheme } from '../utils/trip-themes'

const CITY_LANDMARKS: Record<string, string[]> = {
  昆明: ['翠湖公园', '金马碧鸡坊', '南屏步行街', '云南大学', '官渡古镇', '西山龙门', '滇池海埂公园', '石林风景区'],
  南昌: ['滕王阁', '八一广场', '万寿宫历史文化街区', '绳金塔美食街', '秋水广场', '江西省博物馆'],
  林芝: ['嘎拉桃花村', '雅鲁藏布大峡谷', '南迦巴瓦观景台', '鲁朗林海', '巴松措', '米堆冰川'],
  伊宁: ['赛里木湖', '果子沟大桥', '喀赞其民俗旅游区', '六星街', '伊犁河湿地公园', '那拉提草原'],
  北京: ['天安门广场', '故宫博物院', '景山公园', '颐和园', '南锣鼓巷', '什刹海'],
}

function landmarksFor(destination: string): string[] {
  const key = Object.keys(CITY_LANDMARKS).find((city) => destination.includes(city))
  return key ? CITY_LANDMARKS[key] : []
}

function mockDayPlans(destination: string, days: number): DayPlan[] {
  const pool = landmarksFor(destination)
  return Array.from({ length: days }, (_, index) => {
    const day = index + 1
    const count = 2 + (day % 2)
    const places = Array.from({ length: count }, (_, placeIndex) => {
      if (pool.length) {
        return pool[(index * count + placeIndex) % pool.length]
      }
      const templates = ['中心广场', '特色步行街', '本地美食街', '城市公园', '博物馆']
      return templates[(day + placeIndex) % templates.length]
    })
    return { day, places }
  })
}

async function buildDayPlansFromHotTrip(item: HotTrip, days: number): Promise<DayPlan[]> {
  const destination = item.keywords[0] ?? '热门'
  try {
    const notes = await notesApi.searchNotes(
      `${destination} ${item.keywords.slice(1, 3).join(' ')}`.trim(),
      destination,
    )
    const note = notes[0]
    if (note?.content) {
      const parsed = parseGuideText(note.content)
      if (parsed.dayPlans.length) {
        const plans = parsed.dayPlans.slice(0, days)
        while (plans.length < days) {
          plans.push({ day: plans.length + 1, places: [] })
        }
        return plans
      }
    }
  } catch {
    // fallback below
  }
  return mockDayPlans(destination, days)
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

    async addTripFromGuide(note: XhsNote) {
      const parsed = parseGuideText(note.content)
      const destination = note.destination || parsed.destination
      const dayPlans = parsed.dayPlans
      const days = note.days || parsed.days || dayPlans.length || 1
      const placeCount = dayPlans.reduce((sum, day) => sum + day.places.length, 0)

      const trip = await tripsApi.createTrip({
        destination,
        days,
        preferences: note.keywords.slice(0, 3),
        title: note.title,
        nights: `${days}天${Math.max(days - 1, 0)}晚`,
        placeCount,
        cover: note.cover,
        theme: pickTripTheme(note.id.length + days).bg,
        dayPlans,
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
      const dayPlans = await buildDayPlansFromHotTrip(item, days)
      const placeCount = dayPlans.reduce((sum, day) => sum + day.places.length, 0)

      const trip = await tripsApi.createTrip({
        destination,
        days,
        preferences: item.keywords.slice(1, 3),
        title: item.title,
        nights: item.duration.replace(/\s*·.*/, '').trim(),
        placeCount: placeCount || item.placeCount,
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

    async reviseTrip(
      tripId: number,
      message: string,
      onLog?: (log: aiApi.PlanStreamLog) => void,
    ) {
      await aiApi.reviseTripStream(tripId, message, onLog)
      const fresh = await tripsApi.fetchTrip(tripId)
      upsertTrip(this.trips, fresh)
      return fresh
    },
  },
})
