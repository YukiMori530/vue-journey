export interface TravelGuideSeed {
  id: string
  title: string
  author: string
  cover: string
  destination: string
  days: number
  category: string
  likes: string
  snippet: string
  content: string
  keywords: string[]
}

export const travelGuideSeeds: TravelGuideSeed[] = [
  {
    id: 'guide-beijing-culture-3d',
    title: '北京3日人文经典｜故宫颐和园不绕路',
    author: '京城漫步',
    cover: '/covers/beijing.jpg',
    destination: '北京',
    days: 3,
    category: '人文',
    likes: '2.3w',
    snippet: '市中心人文线 + 长城单独一天，避免八达岭跑错到城区',
    keywords: ['北京', '故宫', '颐和园', '人文'],
    content: `第1天
- 天安门广场
- 故宫博物院
- 景山公园
- 前门大街

第2天
- 颐和园
- 圆明园遗址公园
- 清华大学西门

第3天
- 八达岭长城`,
  },
  {
    id: 'guide-beijing-food-2d',
    title: '北京2日逛吃｜胡同与夜市',
    author: '吃货地图',
    cover: '/covers/beijing.jpg',
    destination: '北京',
    days: 2,
    category: '美食',
    likes: '1.6w',
    snippet: '南锣鼓巷、簋街、牛街，本地小吃集中线路',
    keywords: ['北京', '美食', '胡同', '簋街'],
    content: `第1天
- 南锣鼓巷
- 什刹海
- 鼓楼
- 簋街

第2天
- 牛街清真超市
- 前门大街
- 王府井步行街`,
  },
  {
    id: 'guide-shanghai-citywalk-2d',
    title: '上海2天CityWalk｜外滩陆家嘴经典线',
    author: '城市漫步',
    cover: '/covers/shanghai.jpg',
    destination: '上海',
    days: 2,
    category: 'CityWalk',
    likes: '4.5w',
    snippet: '外滩夜景、豫园小吃、新天地一条线',
    keywords: ['上海', 'CityWalk', '外滩', '陆家嘴'],
    content: `第1天
- 外滩
- 南京路步行街
- 和平饭店
- 陆家嘴滨江

第2天
- 豫园
- 城隍庙小吃
- 新天地
- 武康路`,
  },
  {
    id: 'guide-shanghai-family-1d',
    title: '上海亲子1日｜迪士尼轻量版',
    author: '亲子出行',
    cover: '/covers/shanghai.jpg',
    destination: '上海',
    days: 1,
    category: '亲子',
    likes: '3.2w',
    snippet: '科技馆 + 滨江，适合带娃不赶场',
    keywords: ['上海', '亲子', '科技馆'],
    content: `第1天
- 上海自然博物馆
- 人民广场
- 黄浦江游船码头
- 陆家嘴中心绿地`,
  },
  {
    id: 'guide-chengdu-food-2d',
    title: '成都美食周末游｜本地人私藏路线',
    author: '吃货地图',
    cover: '/covers/chengdu.jpg',
    destination: '成都',
    days: 2,
    category: '美食',
    likes: '1.8w',
    snippet: '宽窄巷子→锦里→建设路，两天吃遍成都',
    keywords: ['成都', '美食', '宽窄巷子', '火锅'],
    content: `第1天
- 宽窄巷子
- 人民公园鹤鸣茶社
- 锦里古街
- 武侯祠

第2天
- 春熙路
- 建设路小吃街
- 太古里
- 玉林路小酒馆`,
  },
  {
    id: 'guide-chengdu-panda-2d',
    title: '成都2日｜熊猫与杜甫草堂',
    author: '蜀地慢游',
    cover: '/covers/chengdu.jpg',
    destination: '成都',
    days: 2,
    category: '人文',
    likes: '2.1w',
    snippet: '熊猫基地早去，下午市区人文景点',
    keywords: ['成都', '熊猫', '杜甫草堂', '人文'],
    content: `第1天
- 成都大熊猫繁育研究基地
- 文殊院
- 奎星楼街

第2天
- 杜甫草堂
- 青羊宫
- 浣花溪公园`,
  },
  {
    id: 'guide-xian-history-3d',
    title: '西安3日历史线｜兵马俑城墙不折返',
    author: '长安旧梦',
    cover: '/covers/default.jpg',
    destination: '西安',
    days: 3,
    category: '人文',
    likes: '3.4w',
    snippet: '东线兵马俑一天，市区城墙钟鼓楼一天',
    keywords: ['西安', '兵马俑', '城墙', '历史'],
    content: `第1天
- 陕西历史博物馆
- 大雁塔
- 大唐不夜城

第2天
- 秦始皇兵马俑博物馆
- 华清宫

第3天
- 西安城墙永宁门
- 钟鼓楼
- 回民街`,
  },
  {
    id: 'guide-xian-food-2d',
    title: '西安2日面食之旅',
    author: '面都指南',
    cover: '/covers/default.jpg',
    destination: '西安',
    days: 2,
    category: '美食',
    likes: '2.8w',
    snippet: '回民街、洒金桥，肉夹馍油泼面路线',
    keywords: ['西安', '美食', '回民街', '面食'],
    content: `第1天
- 洒金桥
- 回民街
- 高家大院

第2天
- 永兴坊
- 碑林博物馆
- 书院门`,
  },
  {
    id: 'guide-hangzhou-westlake-2d',
    title: '杭州2日西湖慢游',
    author: '江南行记',
    cover: '/covers/default.jpg',
    destination: '杭州',
    days: 2,
    category: '自然',
    likes: '3.9w',
    snippet: '断桥→苏堤→雷峰塔，经典环湖顺序',
    keywords: ['杭州', '西湖', '自然', '江南'],
    content: `第1天
- 断桥残雪
- 白堤
- 孤山
- 西泠印社

第2天
- 苏堤春晓
- 花港观鱼
- 雷峰塔
- 河坊街`,
  },
  {
    id: 'guide-hangzhou-tea-1d',
    title: '杭州1日茶文化线',
    author: '茶田日记',
    cover: '/covers/default.jpg',
    destination: '杭州',
    days: 1,
    category: '人文',
    likes: '1.4w',
    snippet: '龙井村 + 九溪，适合周末',
    keywords: ['杭州', '龙井', '茶文化'],
    content: `第1天
- 龙井村
- 九溪烟树
- 中国茶叶博物馆
- 满觉陇`,
  },
  {
    id: 'guide-xiamen-sea-3d',
    title: '厦门3日看海｜鼓浪屿曾厝垵',
    author: '海岛日记',
    cover: '/covers/default.jpg',
    destination: '厦门',
    days: 3,
    category: '海滨',
    likes: '4.1w',
    snippet: '轮渡上岛、环岛路骑行顺序',
    keywords: ['厦门', '鼓浪屿', '看海', '海滨'],
    content: `第1天
- 中山路步行街
- 八市
- 沙坡尾艺术西区

第2天
- 邮轮中心厦鼓码头
- 鼓浪屿日光岩
- 菽庄花园

第3天
- 环岛路
- 曾厝垵
- 南普陀寺`,
  },
  {
    id: 'guide-qingdao-beer-3d',
    title: '青岛三日｜啤酒海鲜吃到爽',
    author: '海边吃货',
    cover: '/covers/default.jpg',
    destination: '青岛',
    days: 3,
    category: '美食',
    likes: '3.8w',
    snippet: '啤酒博物馆→台东→奥帆，海鲜配哈啤',
    keywords: ['青岛', '啤酒', '海鲜', '台东'],
    content: `第1天
- 青岛啤酒博物馆
- 台东步行街
- 营口路海鲜市场

第2天
- 栈桥
- 劈柴院
- 奥帆中心
- 云霄路美食街

第3天
- 石老人海水浴场
- 小麦岛公园
- 极地海洋世界`,
  },
  {
    id: 'guide-qingdao-coast-2d',
    title: '青岛2日海岸线漫步',
    author: '胶东海风',
    cover: '/covers/default.jpg',
    destination: '青岛',
    days: 2,
    category: '海滨',
    likes: '2.5w',
    snippet: '八大关→第二海水浴场，经典沿海线',
    keywords: ['青岛', '海滨', '八大关'],
    content: `第1天
- 八大关风景区
- 第二海水浴场
- 太平角公园

第2天
- 鲁迅公园
- 琴屿路
- 小青岛公园`,
  },
  {
    id: 'guide-chongqing-hotpot-2d',
    title: '重庆2日火锅山城线',
    author: '辣都指南',
    cover: '/covers/default.jpg',
    destination: '重庆',
    days: 2,
    category: '美食',
    likes: '3.6w',
    snippet: '解放碑→洪崖洞→磁器口，夜景+火锅',
    keywords: ['重庆', '火锅', '洪崖洞', '美食'],
    content: `第1天
- 解放碑步行街
- 八一路好吃街
- 洪崖洞
- 千厮门大桥

第2天
- 磁器口古镇
- 李子坝轻轨站
- 鹅岭二厂`,
  },
  {
    id: 'guide-changsha-food-2d',
    title: '长沙2日湘菜逛吃',
    author: '美食雷达',
    cover: '/covers/discover-food.jpg',
    destination: '长沙',
    days: 2,
    category: '美食',
    likes: '4.2w',
    snippet: '五一广场→太平老街→文和友',
    keywords: ['长沙', '美食', '湘菜', '臭豆腐'],
    content: `第1天
- 五一广场
- 太平老街
- 坡子街
- 超级文和友

第2天
- 岳麓山
- 湖南大学
- 橘子洲头`,
  },
  {
    id: 'guide-nanchang-food-3d',
    title: '南昌逛吃三天不重样',
    author: '美食雷达',
    cover: '/covers/discover-food.jpg',
    destination: '南昌',
    days: 3,
    category: '美食',
    likes: '5.6w',
    snippet: '拌粉瓦罐汤水煮，本地人才知道的店',
    keywords: ['南昌', '美食', '逛吃', '瓦罐汤'],
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
    id: 'guide-yantai-sea-3d',
    title: '烟台三日海韵慢行',
    author: '海边日记',
    cover: '/covers/yantai.jpg',
    destination: '烟台',
    days: 3,
    category: '海滨',
    likes: '3.1w',
    snippet: '养马岛、金沙滩、所城里看海线',
    keywords: ['烟台', '看海', '海鲜', '海滨'],
    content: `第1天
- 烟台山
- 所城里
- 朝阳街

第2天
- 养马岛
- 金沙滩海滨公园

第3天
- 蓬莱阁
- 张裕酒文化博物馆`,
  },
  {
    id: 'guide-dunhuang-silk-3d',
    title: '敦煌丝路三日行',
    author: '西北行记',
    cover: '/covers/default.jpg',
    destination: '敦煌',
    days: 3,
    category: '人文',
    likes: '2.9w',
    snippet: '莫高窟→鸣沙山→雅丹，按距离分区安排',
    keywords: ['敦煌', '莫高窟', '鸣沙山', '丝路'],
    content: `第1天
- 莫高窟
- 敦煌博物馆
- 鸣沙山月牙泉
- 沙州夜市

第2天
- 阳关景区
- 玉门关
- 敦煌世界地质公园雅丹景区

第3天
- 敦煌石窟文物保护研究陈列中心
- 雷音寺`,
  },
  {
    id: 'guide-lijiang-oldtown-3d',
    title: '丽江3日古城慢生活',
    author: '云贵日记',
    cover: '/covers/default.jpg',
    destination: '丽江',
    days: 3,
    category: '古城',
    likes: '3.3w',
    snippet: '大研古城→束河→玉龙雪山分日安排',
    keywords: ['丽江', '古城', '玉龙雪山'],
    content: `第1天
- 大研古城
- 木府
- 四方街

第2天
- 束河古镇
- 白沙古镇

第3天
- 玉龙雪山游客中心
- 蓝月谷`,
  },
  {
    id: 'guide-dali-erhai-3d',
    title: '大理3日洱海环线',
    author: '云贵日记',
    cover: '/covers/default.jpg',
    destination: '大理',
    days: 3,
    category: '自然',
    likes: '3.7w',
    snippet: '古城→喜洲→双廊，环海西路顺序',
    keywords: ['大理', '洱海', '古城', '自然'],
    content: `第1天
- 大理古城
- 人民路
- 崇圣寺三塔

第2天
- 喜洲古镇
- 海舌生态公园
- 双廊古镇

第3天
- 洱海生态廊道
- 才村码头
- 龙龛码头`,
  },
  {
    id: 'guide-guilin-scenery-3d',
    title: '桂林3日山水经典',
    author: '漓江行舟',
    cover: '/covers/default.jpg',
    destination: '桂林',
    days: 3,
    category: '自然',
    likes: '4.0w',
    snippet: '象鼻山→两江四湖→阳朔分线',
    keywords: ['桂林', '漓江', '阳朔', '山水'],
    content: `第1天
- 象鼻山
- 两江四湖
- 正阳步行街

第2天
- 漓江竹筏游
- 兴坪古镇
- 二十元人民币背景台

第3天
- 遇龙河
- 西街
- 十里画廊`,
  },
  {
    id: 'guide-sanya-beach-3d',
    title: '三亚3日海滨度假',
    author: '热带假期',
    cover: '/covers/hainan.jpg',
    destination: '三亚',
    days: 3,
    category: '海滨',
    likes: '5.1w',
    snippet: '亚龙湾→天涯海角→蜈支洲岛',
    keywords: ['三亚', '海滨', '度假', '看海'],
    content: `第1天
- 亚龙湾海滩
- 亚龙湾热带天堂森林公园

第2天
- 天涯海角
- 南山文化旅游区

第3天
- 蜈支洲岛
- 后海村`,
  },
  {
    id: 'guide-guangzhou-food-2d',
    title: '广州2日早茶美食线',
    author: '粤味指南',
    cover: '/covers/default.jpg',
    destination: '广州',
    days: 2,
    category: '美食',
    likes: '3.5w',
    snippet: '早茶→上下九→珠江夜游',
    keywords: ['广州', '早茶', '美食', '粤式'],
    content: `第1天
- 点都德
- 北京路步行街
- 沙面岛

第2天
- 上下九步行街
- 陈家祠
- 珠江夜游天字码头`,
  },
  {
    id: 'guide-nanjing-history-2d',
    title: '南京2日六朝人文',
    author: '金陵旧梦',
    cover: '/covers/default.jpg',
    destination: '南京',
    days: 2,
    category: '人文',
    likes: '2.7w',
    snippet: '中山陵→明孝陵→夫子庙顺序',
    keywords: ['南京', '中山陵', '人文', '历史'],
    content: `第1天
- 中山陵
- 明孝陵
- 美龄宫

第2天
- 南京博物院
- 夫子庙
- 秦淮河`,
  },
  {
    id: 'guide-suzhou-garden-2d',
    title: '苏州2日园林古镇',
    author: '江南行记',
    cover: '/covers/default.jpg',
    destination: '苏州',
    days: 2,
    category: '人文',
    likes: '2.4w',
    snippet: '拙政园→平江路→周庄',
    keywords: ['苏州', '园林', '周庄', '江南'],
    content: `第1天
- 拙政园
- 苏州博物馆
- 平江路历史街区

第2天
- 周庄古镇
- 双桥`,
  },
  {
    id: 'guide-wuhan-cherry-2d',
    title: '武汉2日江城漫步',
    author: '江城指南',
    cover: '/covers/default.jpg',
    destination: '武汉',
    days: 2,
    category: 'CityWalk',
    likes: '2.2w',
    snippet: '东湖→黄鹤楼→粮道街',
    keywords: ['武汉', '东湖', '黄鹤楼', '热干面'],
    content: `第1天
- 东湖绿道
- 湖北省博物馆
- 楚河汉街

第2天
- 黄鹤楼
- 户部巷
- 粮道街`,
  },
  {
    id: 'guide-zhangjiajie-nature-3d',
    title: '张家界3日森林公园',
    author: '湘西行者',
    cover: '/covers/default.jpg',
    destination: '张家界',
    days: 3,
    category: '自然',
    likes: '3.0w',
    snippet: '天门山→武陵源→袁家界分日',
    keywords: ['张家界', '天门山', '自然', '森林公园'],
    content: `第1天
- 天门山国家森林公园
- 天门洞

第2天
- 张家界国家森林公园
- 黄石寨

第3天
- 袁家界
- 天子山
- 十里画廊`,
  },
  {
    id: 'guide-harbin-winter-3d',
    title: '哈尔滨3日冰雪之旅',
    author: '北国雪季',
    cover: '/covers/default.jpg',
    destination: '哈尔滨',
    days: 3,
    category: '自然',
    likes: '2.6w',
    snippet: '中央大街→索菲亚→冰雪大世界',
    keywords: ['哈尔滨', '冰雪', '中央大街', '冬季'],
    content: `第1天
- 中央大街
- 圣索菲亚大教堂
- 防洪纪念塔

第2天
- 太阳岛风景区
- 哈尔滨冰雪大世界

第3天
- 老道外中华巴洛克
- 果戈里大街`,
  },
  {
    id: 'guide-shenzhen-weekend-2d',
    title: '深圳2日周末游',
    author: '湾区漫步',
    cover: '/covers/default.jpg',
    destination: '深圳',
    days: 2,
    category: '周末游',
    likes: '1.9w',
    snippet: '市民中心→深圳湾→华侨城',
    keywords: ['深圳', '周末', '深圳湾', 'CityWalk'],
    content: `第1天
- 市民中心
- 莲花山公园
- 深圳湾公园

第2天
- 华侨城创意文化园
- 海上世界
- 蛇口渔港`,
  },
  {
    id: 'guide-kunming-spring-2d',
    title: '昆明2日春城花市',
    author: '云贵日记',
    cover: '/covers/default.jpg',
    destination: '昆明',
    days: 2,
    category: '自然',
    likes: '1.7w',
    snippet: '翠湖→滇池→斗南花市',
    keywords: ['昆明', '滇池', '春城', '自然'],
    content: `第1天
- 翠湖公园
- 云南大学
- 文林街

第2天
- 海埂公园
- 滇池
- 斗南花卉市场`,
  },
  {
    id: 'guide-sanya-island-2d',
    title: '三亚2日海岛轻度假｜蜈支洲与后海',
    author: '热带假期',
    cover: '/covers/hainan.jpg',
    destination: '三亚',
    days: 2,
    category: '海滨',
    likes: '3.8w',
    snippet: '蜈支洲岛浮潜 + 后海村日落，适合第一次来三亚',
    keywords: ['三亚', '蜈支洲', '后海', '浮潜'],
    content: `第1天
- 蜈支洲岛
- 情人桥
- 后海村

第2天
- 亚龙湾海滩
- 鹿回头风景区
- 第一市场`,
  },
  {
    id: 'guide-lijiang-yulong-2d',
    title: '丽江2日｜古城与玉龙雪山',
    author: '滇西行记',
    cover: '/covers/default.jpg',
    destination: '丽江',
    days: 2,
    category: '自然',
    likes: '3.2w',
    snippet: '大研古城慢逛，雪山蓝月谷一日线',
    keywords: ['丽江', '玉龙雪山', '蓝月谷', '古城'],
    content: `第1天
- 丽江古城
- 四方街
- 狮子山万古楼

第2天
- 玉龙雪山
- 蓝月谷
- 束河古镇`,
  },
  {
    id: 'guide-nanjing-qinhuai-1d',
    title: '南京1日秦淮夜逛',
    author: '金陵旧梦',
    cover: '/covers/default.jpg',
    destination: '南京',
    days: 1,
    category: '美食',
    likes: '2.1w',
    snippet: '夫子庙小吃 + 秦淮河夜游，城区轻松线',
    keywords: ['南京', '夫子庙', '秦淮河', '美食'],
    content: `第1天
- 夫子庙
- 秦淮河画舫码头
- 老门东
- 南京大牌档`,
  },
  {
    id: 'guide-guangzhou-weekend-1d',
    title: '广州1日老城漫步',
    author: '粤味指南',
    cover: '/covers/default.jpg',
    destination: '广州',
    days: 1,
    category: 'CityWalk',
    likes: '2.4w',
    snippet: '沙面岛欧式建筑 + 永庆坊骑楼',
    keywords: ['广州', '沙面', '永庆坊', 'CityWalk'],
    content: `第1天
- 沙面岛
- 永庆坊
- 陈家祠
- 北京路步行街`,
  },
  {
    id: 'guide-xiamen-island-2d',
    title: '厦门2日海岛文艺线',
    author: '鹭岛慢游',
    cover: '/covers/default.jpg',
    destination: '厦门',
    days: 2,
    category: '海滨',
    likes: '3.6w',
    snippet: '鼓浪屿 + 环岛路骑行，适合周末小假',
    keywords: ['厦门', '鼓浪屿', '环岛路', '文艺'],
    content: `第1天
- 鼓浪屿
- 日光岩
- 菽庄花园

第2天
- 环岛路
- 曾厝垵
- 南普陀寺`,
  },
  {
    id: 'guide-dali-erhai-2d',
    title: '大理2日洱海环线',
    author: '滇西行记',
    cover: '/covers/default.jpg',
    destination: '大理',
    days: 2,
    category: '自然',
    likes: '2.9w',
    snippet: '洱海骑行 + 喜洲古镇，风花雪月经典线',
    keywords: ['大理', '洱海', '喜洲', '古城'],
    content: `第1天
- 大理古城
- 人民路
- 崇圣寺三塔

第2天
- 喜洲古镇
- 双廊古镇
- 洱海生态廊道`,
  },
  {
    id: 'guide-guilin-yangshuo-2d',
    title: '桂林2日阳朔山水',
    author: '漓江行舟',
    cover: '/covers/default.jpg',
    destination: '桂林',
    days: 2,
    category: '自然',
    likes: '3.1w',
    snippet: '象鼻山 CityWalk + 阳朔西街夜逛',
    keywords: ['桂林', '阳朔', '西街', '山水'],
    content: `第1天
- 象鼻山
- 两江四湖
- 正阳步行街

第2天
- 阳朔西街
- 遇龙河
- 十里画廊`,
  },
  {
    id: 'guide-shenzhen-tech-1d',
    title: '深圳1日湾区CityWalk',
    author: '湾区漫步',
    cover: '/covers/default.jpg',
    destination: '深圳',
    days: 1,
    category: 'CityWalk',
    likes: '1.5w',
    snippet: '深圳湾看海 + 华侨城创意园',
    keywords: ['深圳', '深圳湾', '华侨城', 'CityWalk'],
    content: `第1天
- 深圳湾公园
- 人才公园
- 华侨城创意文化园
- 海上世界`,
  },
  {
    id: 'guide-wuhan-cherry-2d',
    title: '武汉2日江城经典',
    author: '江城笔记',
    cover: '/covers/default.jpg',
    destination: '武汉',
    days: 2,
    category: '人文',
    likes: '2.2w',
    snippet: '黄鹤楼 + 东湖绿道，江城地标不绕路',
    keywords: ['武汉', '黄鹤楼', '东湖', '热干面'],
    content: `第1天
- 黄鹤楼
- 户部巷
- 长江大桥

第2天
- 东湖绿道
- 湖北省博物馆
- 楚河汉街`,
  },
  {
    id: 'guide-chongqing-hotpot-2d',
    title: '重庆2日火锅与夜景',
    author: '山城味道',
    cover: '/covers/default.jpg',
    destination: '重庆',
    days: 2,
    category: '美食',
    likes: '4.2w',
    snippet: '解放碑逛吃 + 洪崖洞夜景，8D 魔幻山城',
    keywords: ['重庆', '火锅', '洪崖洞', '夜景'],
    content: `第1天
- 解放碑步行街
- 八一路好吃街
- 洪崖洞

第2天
- 李子坝轻轨站
- 鹅岭二厂
- 南山一棵树`,
  },
  {
    id: 'guide-pingtan-blue-tears-3d',
    title: '平潭岛3日环岛追泪｜蓝眼泪与风车海',
    author: '海岛追光',
    cover: '/covers/default.jpg',
    destination: '平潭',
    days: 3,
    category: '滨海',
    likes: '3.1w',
    snippet: '坛南湾追泪 + 长江澳风车田 + 北港石头厝，经典环岛线',
    keywords: ['平潭', '平潭岛', '蓝眼泪', '环岛', '坛南湾'],
    content: `第1天
- 龙王头沙滩
- 海坛古城
- 坛南湾

第2天
- 北港村
- 长江澳风力田
- 镜沙

第3天
- 猴研岛
- 石牌洋景区
- 象鼻湾`,
  },
  {
    id: 'guide-pingtan-seafood-2d',
    title: '平潭2日海鲜与渔村慢游',
    author: '闽东味道',
    cover: '/covers/default.jpg',
    destination: '平潭',
    days: 2,
    category: '美食',
    likes: '1.8w',
    snippet: '流水镇海鲜大排档 + 澳前渔村，适合第一次来平潭',
    keywords: ['平潭', '平潭岛', '海鲜', '渔村', '流水镇'],
    content: `第1天
- 澳前镇
- 68海里景区
- 流水镇海鲜市场

第2天
- 塘屿岛
- 大福村
- 龙凤头海滨浴场`,
  },
]
