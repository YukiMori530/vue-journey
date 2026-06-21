const SIGHT_COVERS = [
  '/covers/discover-mountain.jpg',
  '/covers/discover-city.jpg',
  '/covers/discover-flower.jpg',
  '/covers/discover-stream.jpg',
  '/covers/discover-book.jpg',
  '/covers/beijing.jpg',
  '/covers/shanghai.jpg',
  '/covers/chengdu.jpg',
]

const FOOD_COVERS = [
  '/covers/discover-food.jpg',
  '/covers/discover-cafe.jpg',
  '/covers/yantai.jpg',
  '/covers/hainan.jpg',
  '/covers/discover-city.jpg',
  '/covers/default.jpg',
]

function hashString(input: string): number {
  let hash = 0
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) | 0
  }
  return Math.abs(hash)
}

export function pickStopCover(name: string, category?: string, index = 0): string {
  const pool =
    category === 'food' || category === '美食' ? FOOD_COVERS : SIGHT_COVERS
  return pool[(hashString(name) + index) % pool.length]
}
