export interface PlaceSuggestion {
  name: string
  region: string
}

const PLACE_DB: PlaceSuggestion[] = [
  { name: '三亚市', region: '海南省, 中国' },
  { name: '三鹰市', region: '东京, 日本' },
  { name: '三岛', region: '静冈, 日本' },
  { name: '三明市', region: '福建省, 中国' },
  { name: '三清山', region: '江西省, 中国' },
  { name: '成都市', region: '四川省, 中国' },
  { name: '烟台市', region: '山东省, 中国' },
  { name: '北京市', region: '中国' },
  { name: '上海市', region: '中国' },
  { name: '新干县', region: '江西省, 中国' },
  { name: '南昌市', region: '江西省, 中国' },
  { name: '杭州市', region: '浙江省, 中国' },
]

export function searchPlaceSuggestions(query: string): PlaceSuggestion[] {
  const q = query.trim()
  if (!q) {
    return []
  }

  return PLACE_DB.filter(
    (item) => item.name.includes(q) || item.region.includes(q) || q.includes(item.name.replace(/市|县/, '')),
  ).slice(0, 8)
}
