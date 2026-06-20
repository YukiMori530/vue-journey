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

export const xhsNotes: XhsNote[] = [
  {
    id: 'xhs-1',
    title: '北京3日慢游｜故宫颐和园必打卡路线',
    author: '旅行小记',
    cover: '/covers/beijing.jpg',
    destination: '北京',
    days: 3,
    likes: '2.3w',
    snippet: '第一天故宫+景山，第二天颐和园，第三天胡同美食…',
    keywords: ['北京', '故宫', '颐和园'],
    content: `第1天
- 故宫博物院
- 景山公园
- 南锣鼓巷

第2天
- 颐和园
- 圆明园
- 簋街

第3天
- 三里屯太古里
- 国家体育场
- 星巴克臻选`,
  },
  {
    id: 'xhs-2',
    title: '成都美食周末游｜本地人私藏路线',
    author: '吃货地图',
    cover: '/covers/chengdu.jpg',
    destination: '成都',
    days: 2,
    likes: '1.8w',
    snippet: '宽窄巷子→锦里→建设路小吃，两天吃遍成都…',
    keywords: ['成都', '美食', '宽窄巷子'],
    content: `第1天
- 宽窄巷子
- 锦里古街
- 武侯祠
- 玉林路小酒馆

第2天
- 春熙路
- 建设路小吃街
- 太古里`,
  },
  {
    id: 'xhs-3',
    title: '烟台三日海韵慢行｜看海吃海鲜',
    author: '海边日记',
    cover: '/covers/yantai.jpg',
    destination: '烟台',
    days: 3,
    likes: '3.1w',
    snippet: '养马岛、金沙滩、所城里…烟台看海完整攻略',
    keywords: ['烟台', '看海', '海鲜'],
    content: `第1天
- 烟台山
- 所城里
- 海边咖啡

第2天
- 养马岛
- 金沙滩
- 万象汇

第3天
- 蓬莱阁
- 烟台中心大酒店`,
  },
  {
    id: 'xhs-4',
    title: '上海2天CityWalk｜外滩陆家嘴经典线',
    author: '城市漫步',
    cover: '/covers/shanghai.jpg',
    destination: '上海',
    days: 2,
    likes: '4.5w',
    snippet: '外滩夜景、豫园小吃、新天地咖啡一条线走完',
    keywords: ['上海', 'CityWalk', '外滩'],
    content: `第1天
- 外滩
- 东方明珠
- 南京路步行街
- 和平饭店

第2天
- 豫园
- 城隍庙小吃
- 新天地
- 陆家嘴`,
  },
  {
    id: 'xhs-5',
    title: '南昌逛吃三天不重样｜民间米其林',
    author: '美食雷达',
    cover: '/covers/discover-food.jpg',
    destination: '南昌',
    days: 3,
    likes: '5.6w',
    snippet: '拌粉、瓦罐汤、水煮…南昌本地人才知道的店',
    keywords: ['南昌', '美食', '逛吃'],
    content: `第1天
- 八一广场
- 万寿宫
- 大士院小吃

第2天
- 滕王阁
- 绳金塔美食街
- 秋水广场

第3天
- 艾溪湖
- 珠宝街
- 南昌之星`,
  },
  {
    id: 'xhs-6',
    title: '青岛三日｜啤酒海鲜吃到爽',
    author: '海边吃货',
    cover: '/covers/default.jpg',
    destination: '青岛',
    days: 3,
    likes: '3.8w',
    snippet: '啤酒博物馆→台东夜市→劈柴院海鲜，青岛哈啤配海鲜攻略',
    keywords: ['青岛', '啤酒', '海鲜', '台东'],
    content: `第1天
- 青岛啤酒博物馆
- 台东步行街
- 营口路海鲜市场

第2天
- 栈桥
- 劈柴院
- 奥帆中心

第3天
- 石老人海水浴场
- 小麦岛公园
- 极地海洋世界`,
  },
]
