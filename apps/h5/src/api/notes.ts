import { request } from './client'

export interface XhsNote {
  id: string
  title: string
  author: string
  cover: string
  destination: string
  days: number
  category?: string
  likes: string
  snippet: string
  content: string
  keywords: string[]
}

export interface ExploreCollectionItem {
  id: string
  title: string
  cover: string
  destination: string
}

export interface ExploreHotCity {
  id: string
  name: string
  cover: string
  planCount: string
  description: string
  rankTag?: string
  guideCount: number
}

export interface ExploreFeed {
  collections: ExploreCollectionItem[]
  hotCities: ExploreHotCity[]
}

export function fetchExploreFeed() {
  return request<ExploreFeed>('/api/notes/feed/explore')
}

export function fetchCityGuides(destination: string) {
  const dest = encodeURIComponent(destination)
  return request<XhsNote[]>(`/api/notes/city/${dest}`)
}

export function searchNotes(query: string, destination?: string) {
  const q = encodeURIComponent(query)
  const dest = destination ? `&destination=${encodeURIComponent(destination)}` : ''
  return request<XhsNote[]>(`/api/notes/search?q=${q}${dest}`)
}

export function fetchNote(id: string) {
  return request<XhsNote>(`/api/notes/${id}`)
}
