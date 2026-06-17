export interface CollectGroup {
  id: string
  name: string
}

export interface CollectItem {
  id: string
  photo: string
  locationName: string
  lng: number
  lat: number
  groupId: string
  createdAt: string
}

export const COLLECT_STORAGE_KEY = 'tuhui-collect'

export const DEFAULT_GROUPS: CollectGroup[] = [
  { id: 'favorite', name: '喜欢' },
]
