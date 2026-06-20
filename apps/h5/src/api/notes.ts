import { request } from './client'

export interface XhsNote {
  id: string
  title: string
  author: string
  cover: string
  destination: string
  days: number
  likes: string
  snippet: string
  content: string
  keywords: string[]
}

export function searchNotes(query: string) {
  const q = encodeURIComponent(query)
  return request<XhsNote[]>(`/api/notes/search?q=${q}`)
}

export function fetchNote(id: string) {
  return request<XhsNote>(`/api/notes/${id}`)
}
