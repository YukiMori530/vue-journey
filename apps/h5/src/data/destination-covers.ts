/** 探索页/攻略卡片按目的地匹配的本地封面 */
export const DESTINATION_COVERS: Record<string, string> = {
  北京: '/covers/beijing.jpg',
  上海: '/covers/shanghai.jpg',
  成都: '/covers/chengdu.jpg',
  海南: '/covers/hainan.jpg',
  三亚: '/covers/hainan.jpg',
  海口: '/covers/hainan.jpg',
  烟台: '/covers/yantai.jpg',
  丽江: '/covers/lijiang.jpg',
  乌镇: '/covers/wuzhen.jpg',
  杭州: '/covers/discover-flower.jpg',
  西安: '/covers/discover-mountain.jpg',
  青岛: '/covers/discover-stream.jpg',
  南京: '/covers/discover-city.jpg',
  苏州: '/covers/discover-stream.jpg',
  厦门: '/covers/discover-stream.jpg',
  桂林: '/covers/discover-mountain.jpg',
  大理: '/covers/discover-mountain.jpg',
  敦煌: '/covers/discover-mountain.jpg',
  张家界: '/covers/discover-mountain.jpg',
  黄山: '/covers/discover-mountain.jpg',
  舟山: '/covers/discover-stream.jpg',
  凤凰: '/covers/discover-city.jpg',
  西塘: '/covers/wuzhen.jpg',
  嘉兴: '/covers/wuzhen.jpg',
  广州: '/covers/discover-food.jpg',
  重庆: '/covers/discover-food.jpg',
  长沙: '/covers/discover-food.jpg',
  武汉: '/covers/discover-city.jpg',
  天津: '/covers/discover-city.jpg',
  昆明: '/covers/discover-flower.jpg',
  拉萨: '/covers/discover-mountain.jpg',
  乌鲁木齐: '/covers/discover-mountain.jpg',
  哈尔滨: '/covers/discover-city.jpg',
  大连: '/covers/discover-stream.jpg',
  洛阳: '/covers/discover-city.jpg',
  开封: '/covers/discover-city.jpg',
}

const DISCOVER_ROTATION = [
  '/covers/discover-city.jpg',
  '/covers/discover-mountain.jpg',
  '/covers/discover-stream.jpg',
  '/covers/discover-flower.jpg',
  '/covers/discover-food.jpg',
] as const

/** 无专属封面时按目的地名稳定分配一张 discover 图 */
export function coverForDestination(destination: string): string {
  const city = destination.replace(/(市|县|区|省|镇)$/, '').trim()
  if (DESTINATION_COVERS[city]) {
    return DESTINATION_COVERS[city]
  }

  let hash = 0
  for (let index = 0; index < city.length; index += 1) {
    hash = (hash * 31 + city.charCodeAt(index)) | 0
  }
  return DISCOVER_ROTATION[Math.abs(hash) % DISCOVER_ROTATION.length]
}
