export interface MapStory {
  id: string
  cityId: string
  cover: string
  text: string
  location: string
  lng: number
  lat: number
}

export interface ExploreCollection {
  id: number
  title: string
  cover: string
}

export interface HotCity {
  id: string
  name: string
  cover: string
  rankTag?: string
  planCount: string
  description: string
}

export const mapStories: MapStory[] = [
  {
    id: 'bj-1',
    cityId: 'beijing',
    cover: '/covers/discover-mountain.jpg',
    text: '在北京最好的季节遇到它',
    location: '北京市',
    lng: 116.4074,
    lat: 39.9042,
  },
  {
    id: 'tj-1',
    cityId: 'beijing',
    cover: '/covers/discover-city.jpg',
    text: '桥边看游船像老电影',
    location: '天津市',
    lng: 117.2008,
    lat: 39.0842,
  },
  {
    id: 'bd-1',
    cityId: 'beijing',
    cover: '/covers/discover-food.jpg',
    text: '驴肉火烧脆得掉渣',
    location: '高碑店市',
    lng: 115.8736,
    lat: 39.3269,
  },
  {
    id: 'cd-1',
    cityId: 'chengdu',
    cover: '/covers/chengdu.jpg',
    text: '巷子里飘出来的火锅香',
    location: '成都市',
    lng: 104.0665,
    lat: 30.5723,
  },
  {
    id: 'yt-1',
    cityId: 'yantai',
    cover: '/covers/yantai.jpg',
    text: '海风吹过来的时候最慢',
    location: '烟台市',
    lng: 121.4479,
    lat: 37.4638,
  },
  {
    id: 'sh-1',
    cityId: 'shanghai',
    cover: '/covers/shanghai.jpg',
    text: '外滩亮灯像一条河',
    location: '上海市',
    lng: 121.4903,
    lat: 31.2417,
  },
]

export const exploreCollections: ExploreCollection[] = [
  {
    id: 1,
    title: '端午3天都不下雨的城市，只有…',
    cover: '/covers/hainan.jpg',
  },
  {
    id: 2,
    title: '杭州含绿量100%的13家餐厅',
    cover: '/covers/discover-flower.jpg',
  },
  {
    id: 3,
    title: '换个方式感受初夏',
    cover: '/covers/discover-stream.jpg',
  },
]

export const hotCities: HotCity[] = [
  {
    id: 'beijing',
    name: '北京市',
    cover: '/covers/beijing.jpg',
    rankTag: '中国热度 top2',
    planCount: '57.6w 人计划前往',
    description: '凌晨三点的铜锅涮肉，是北京最诚实的温柔。',
  },
  {
    id: 'tianjin',
    name: '天津市',
    cover: '/covers/discover-city.jpg',
    rankTag: '中国热度 top5',
    planCount: '12.3w 人计划前往',
    description: '坐在桥边看游船，像一部老电影。',
  },
  {
    id: 'baoding',
    name: '保定市',
    cover: '/covers/discover-food.jpg',
    planCount: '8.1w 人计划前往',
    description: '驴肉火烧的脆，是这座城最响亮的招呼。',
  },
]

/** 演示口令 → 热门行程 id */
export const passcodeHotTripMap: Record<string, number> = {
  '8888': 4,
  '6666': 1,
  '5200': 2,
}
