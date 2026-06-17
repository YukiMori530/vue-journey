export interface HotTrip {
  id: number
  title: string
  duration: string
  placeCount: number
  cover: string
  keywords: string[]
}

export interface FeaturedTopic {
  id: number
  title: string
  snippet: string
  placeCount: number
  cover: string
  keywords: string[]
}

export const hotTrips: HotTrip[] = [
  {
    id: 1,
    title: '初夏伊宁8日游：从雪山牧歌到赛里木湖',
    duration: '8天7晚',
    placeCount: 23,
    cover: '/covers/discover-mountain.jpg',
    keywords: ['伊宁', '新疆', '雪山', '赛里木湖', '草原'],
  },
  {
    id: 2,
    title: '南昌是民间米其林 | 逛吃三天不重样',
    duration: '3天2晚',
    placeCount: 20,
    cover: '/covers/discover-food.jpg',
    keywords: ['南昌', '美食', '逛吃', '小吃'],
  },
  {
    id: 3,
    title: '林芝4日游 | 桃花节指南',
    duration: '4天3晚',
    placeCount: 18,
    cover: '/covers/discover-flower.jpg',
    keywords: ['林芝', '桃花', '西藏', '春天'],
  },
  {
    id: 4,
    title: '昆明二日游 | 跟着汪曾祺漫步',
    duration: '02.05至02.07 · 3天2晚',
    placeCount: 10,
    cover: '/covers/discover-city.jpg',
    keywords: ['昆明', '云南', '文艺', '漫步'],
  },
]

export const featuredTopics: FeaturedTopic[] = [
  {
    id: 1,
    title: '香港街巷里，藏着些不一样的书店',
    snippet: '在香港，独立书店不只是卖书。它们藏在楼梯转角、旧商场里……',
    placeCount: 13,
    cover: '/covers/discover-book.jpg',
    keywords: ['香港', '书店', '街巷', '文艺'],
  },
  {
    id: 2,
    title: '当年的漂亮饭，现在怎么样了？',
    snippet: '上岛咖啡、雕刻时光、豪享来……千禧年流行的那些餐厅',
    placeCount: 8,
    cover: '/covers/discover-cafe.jpg',
    keywords: ['餐厅', '怀旧', '咖啡', '美食'],
  },
  {
    id: 3,
    title: '当个「野孩子」，踩初夏第一条溪流',
    snippet: '提到夏天，你会不会先想到冰凉的溪水？找一条浅溪……',
    placeCount: 11,
    cover: '/covers/discover-stream.jpg',
    keywords: ['夏天', '溪流', '户外', '自然'],
  },
]

export function matchKeyword(text: string, keyword: string) {
  return text.toLowerCase().includes(keyword.trim().toLowerCase())
}

export function filterDiscover(keyword: string) {
  const key = keyword.trim()
  if (!key) {
    return { trips: hotTrips, topics: featuredTopics }
  }

  const trips = hotTrips.filter(
    (item) =>
      matchKeyword(item.title, key) ||
      item.keywords.some((word) => matchKeyword(word, key)),
  )
  const topics = featuredTopics.filter(
    (item) =>
      matchKeyword(item.title, key) ||
      matchKeyword(item.snippet, key) ||
      item.keywords.some((word) => matchKeyword(word, key)),
  )
  return { trips, topics }
}
