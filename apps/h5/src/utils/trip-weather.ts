export interface WeatherDay {
  label: string
  desc: string
  low: number
  high: number
}

function formatLabel(date: Date) {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const week = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
  const today = new Date()
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  return isToday ? `${month}.${day} 今天` : `${month}.${day} 周${week}`
}

/** 演示用目的地天气（无第三方 API） */
export function mockDestinationWeather(destination: string): WeatherDay[] {
  const coastal = /青岛|烟台|上海|厦门|三亚|海南/.test(destination)
  const west = /敦煌|西安|兰州/.test(destination)
  const baseHigh = coastal ? 28 : west ? 32 : 26
  const baseLow = coastal ? 18 : west ? 14 : 16

  return Array.from({ length: 3 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() + index)
    const desc = index === 0 ? '晴' : index === 1 ? '多云' : '阴'
    return {
      label: formatLabel(date),
      desc,
      low: baseLow + index,
      high: baseHigh - index,
    }
  })
}
