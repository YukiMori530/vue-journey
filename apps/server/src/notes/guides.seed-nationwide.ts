import type { TravelGuideSeed } from './guides.seed-data';

/** 全国热门目的地补充攻略（POI 均为高德可检索的正式名称） */
export const nationwideGuideSeeds: TravelGuideSeed[] = [
  {
    id: 'guide-fuzhou-2d',
    title: '福州2日闽都经典｜三坊七巷与鼓山',
    author: '闽都行记',
    cover: '/covers/default.jpg',
    destination: '福州',
    days: 2,
    category: '人文',
    likes: '1.4w',
    snippet: '三坊七巷古厝 + 鼓山涌泉寺，适合周末轻旅行',
    keywords: ['福州', '三坊七巷', '鼓山', '闽都'],
    content: `第1天
- 三坊七巷
- 林则徐纪念馆
- 西湖公园
- 福建博物院

第2天
- 鼓山
- 涌泉寺
- 烟台山历史风貌区`,
  },
  {
    id: 'guide-wuyishan-2d',
    title: '武夷山2日茶文化之旅',
    author: '茶路行者',
    cover: '/covers/default.jpg',
    destination: '武夷山',
    days: 2,
    category: '自然',
    likes: '2.0w',
    snippet: '天游峰俯瞰九曲溪，竹筏漂流经典线',
    keywords: ['武夷山', '九曲溪', '天游峰', '大红袍'],
    content: `第1天
- 武夷宫
- 天游峰
- 大红袍景区

第2天
- 九曲溪竹筏码头
- 一线天
- 虎啸岩`,
  },
  {
    id: 'guide-huangshan-3d',
    title: '黄山3日奇松云海｜前山上后山下',
    author: '徽州行旅',
    cover: '/covers/default.jpg',
    destination: '黄山',
    days: 3,
    category: '自然',
    likes: '3.8w',
    snippet: '迎客松、光明顶、宏村西递经典组合',
    keywords: ['黄山', '迎客松', '宏村', '西递'],
    content: `第1天
- 黄山南大门
- 慈光阁
- 迎客松
- 光明顶

第2天
- 西海大峡谷
- 飞来石
- 排云亭

第3天
- 宏村
- 南湖
- 西递古村落`,
  },
  {
    id: 'guide-taishan-2d',
    title: '泰山2日登临｜日出与岱庙',
    author: '齐鲁行者',
    cover: '/covers/default.jpg',
    destination: '泰山',
    days: 2,
    category: '自然',
    likes: '2.5w',
    snippet: '红门步行或天外村乘车，山顶看日出',
    keywords: ['泰山', '岱庙', '红门', '日观峰'],
    content: `第1天
- 岱庙
- 红门
- 中天门
- 南天门

第2天
- 玉皇顶
- 日观峰
- 天街`,
  },
  {
    id: 'guide-emeishan-2d',
    title: '峨眉山2日礼佛线｜金顶云海',
    author: '蜀山笔记',
    cover: '/covers/default.jpg',
    destination: '峨眉山',
    days: 2,
    category: '人文',
    likes: '2.2w',
    snippet: '报国寺进山，金顶观云海佛光',
    keywords: ['峨眉山', '金顶', '报国寺', '乐山'],
    content: `第1天
- 报国寺
- 清音阁
- 万年寺
- 生态猴区

第2天
- 雷洞坪
- 接引殿
- 金顶`,
  },
  {
    id: 'guide-leshan-1d',
    title: '乐山1日大佛精华',
    author: '蜀山笔记',
    cover: '/covers/default.jpg',
    destination: '乐山',
    days: 1,
    category: '人文',
    likes: '1.9w',
    snippet: '乐山大佛 + 乌尤寺，半日可完成',
    keywords: ['乐山', '乐山大佛', '乌尤寺'],
    content: `第1天
- 乐山大佛
- 乌尤寺
- 嘉定坊`,
  },
  {
    id: 'guide-jiuzhaigou-3d',
    title: '九寨沟3日秋色｜海子与瀑布',
    author: '川西摄影',
    cover: '/covers/default.jpg',
    destination: '九寨沟',
    days: 3,
    category: '自然',
    likes: '4.1w',
    snippet: '树正沟、日则沟、则查洼沟经典三沟',
    keywords: ['九寨沟', '五花海', '诺日朗瀑布', '长海'],
    content: `第1天
- 九寨沟风景区
- 树正群海
- 犀牛海

第2天
- 珍珠滩瀑布
- 五花海
- 熊猫海

第3天
- 长海
- 五彩池
- 诺日朗瀑布`,
  },
  {
    id: 'guide-guiyang-2d',
    title: '贵阳2日爽爽游｜酸汤与青岩',
    author: '黔行记',
    cover: '/covers/default.jpg',
    destination: '贵阳',
    days: 2,
    category: '美食',
    likes: '1.3w',
    snippet: '甲秀楼夜景 + 青岩古镇猪脚',
    keywords: ['贵阳', '甲秀楼', '青岩古镇', '酸汤鱼'],
    content: `第1天
- 甲秀楼
- 翠微园
- 黔灵山公园
- 弘福寺

第2天
- 青岩古镇
- 花溪公园
- 二七路小吃街`,
  },
  {
    id: 'guide-lhasa-3d',
    title: '拉萨3日圣城初体验',
    author: '藏地行记',
    cover: '/covers/default.jpg',
    destination: '拉萨',
    days: 3,
    category: '人文',
    likes: '2.7w',
    snippet: '布达拉宫、大昭寺、八廓街转经',
    keywords: ['拉萨', '布达拉宫', '大昭寺', '八廓街'],
    content: `第1天
- 布达拉宫
- 布达拉宫广场
- 药王山观景台

第2天
- 大昭寺
- 八廓街
- 小昭寺

第3天
- 色拉寺
- 罗布林卡
- 西藏博物馆`,
  },
  {
    id: 'guide-chengde-2d',
    title: '承德2日避暑山庄｜外八庙',
    author: '燕北行记',
    cover: '/covers/default.jpg',
    destination: '承德',
    days: 2,
    category: '人文',
    likes: '1.5w',
    snippet: '避暑山庄 + 普宁寺，经典两日线',
    keywords: ['承德', '避暑山庄', '普宁寺', '外八庙'],
    content: `第1天
- 避暑山庄
- 丽正门
- 烟雨楼

第2天
- 普宁寺
- 普陀宗乘之庙
- 磬锤峰`,
  },
  {
    id: 'guide-qinhuangdao-2d',
    title: '秦皇岛2日海滨｜北戴河阿那亚',
    author: '渤海行记',
    cover: '/covers/default.jpg',
    destination: '秦皇岛',
    days: 2,
    category: '滨海',
    likes: '2.4w',
    snippet: '鸽子窝看日出，阿那亚孤独图书馆',
    keywords: ['秦皇岛', '北戴河', '阿那亚', '鸽子窝'],
    content: `第1天
- 鸽子窝公园
- 老虎石海上公园
- 刘庄夜市

第2天
- 阿那亚
- 孤独图书馆
- 山海关`,
  },
  {
    id: 'guide-luoyang-2d',
    title: '洛阳2日千年古都｜龙门石窟',
    author: '河洛行记',
    cover: '/covers/default.jpg',
    destination: '洛阳',
    days: 2,
    category: '人文',
    likes: '2.1w',
    snippet: '龙门石窟 + 白马寺 + 丽景门',
    keywords: ['洛阳', '龙门石窟', '白马寺', '丽景门'],
    content: `第1天
- 龙门石窟
- 香山寺
- 白园

第2天
- 白马寺
- 丽景门
- 洛阳博物馆`,
  },
  {
    id: 'guide-zhengzhou-shaolin-2d',
    title: '郑州2日少林中原行',
    author: '中原行者',
    cover: '/covers/default.jpg',
    destination: '郑州',
    days: 2,
    category: '人文',
    likes: '1.7w',
    snippet: '少林寺武术表演 + 河南博物院',
    keywords: ['郑州', '少林寺', '河南博物院', '登封'],
    content: `第1天
- 少林寺
- 塔林
- 三皇寨

第2天
- 河南博物院
- 二七纪念塔
- 郑州黄河风景名胜区`,
  },
  {
    id: 'guide-yangzhou-2d',
    title: '扬州2日慢生活｜瘦西湖早茶',
    author: '江南行记',
    cover: '/covers/default.jpg',
    destination: '扬州',
    days: 2,
    category: '人文',
    likes: '1.8w',
    snippet: '瘦西湖 + 个园 + 东关街早茶',
    keywords: ['扬州', '瘦西湖', '个园', '早茶'],
    content: `第1天
- 瘦西湖
- 五亭桥
- 大明寺

第2天
- 个园
- 东关街
- 何园`,
  },
  {
    id: 'guide-wuxi-2d',
    title: '无锡2日太湖樱季',
    author: '江南行记',
    cover: '/covers/default.jpg',
    destination: '无锡',
    days: 2,
    category: '自然',
    likes: '2.3w',
    snippet: '鼋头渚赏樱 + 灵山大佛',
    keywords: ['无锡', '鼋头渚', '灵山大佛', '惠山古镇'],
    content: `第1天
- 鼋头渚
- 太湖仙岛
- 蠡园

第2天
- 灵山大佛
- 梵宫
- 惠山古镇`,
  },
  {
    id: 'guide-ningbo-2d',
    title: '宁波2日港城人文',
    author: '浙东行记',
    cover: '/covers/default.jpg',
    destination: '宁波',
    days: 2,
    category: '人文',
    likes: '1.2w',
    snippet: '天一阁 + 老外滩夜景',
    keywords: ['宁波', '天一阁', '老外滩', '东钱湖'],
    content: `第1天
- 天一阁博物院
- 月湖公园
- 鼓楼

第2天
- 老外滩
- 南塘老街
- 东钱湖`,
  },
  {
    id: 'guide-shaoxing-2d',
    title: '绍兴2日鲁迅故里',
    author: '浙东行记',
    cover: '/covers/default.jpg',
    destination: '绍兴',
    days: 2,
    category: '人文',
    likes: '1.6w',
    snippet: '鲁迅故里 + 沈园 + 兰亭书法',
    keywords: ['绍兴', '鲁迅故里', '沈园', '兰亭'],
    content: `第1天
- 鲁迅故里
- 三味书屋
- 沈园

第2天
- 兰亭景区
- 东湖景区
- 仓桥直街`,
  },
  {
    id: 'guide-wuzhen-2d',
    title: '乌镇2日水乡慢游',
    author: '江南行记',
    cover: '/covers/wuzhen.jpg',
    destination: '乌镇',
    days: 2,
    category: '古镇',
    likes: '3.0w',
    snippet: '东栅西栅联游，夜景与早市',
    keywords: ['乌镇', '水乡', '西栅', '东栅'],
    content: `第1天
- 乌镇东栅景区
- 茅盾故居
- 江南百床馆

第2天
- 乌镇西栅景区
- 昭明书院
- 乌镇大剧院`,
  },
  {
    id: 'guide-putuoshan-2d',
    title: '普陀山2日礼佛海岛',
    author: '东海行记',
    cover: '/covers/default.jpg',
    destination: '舟山',
    days: 2,
    category: '人文',
    likes: '2.0w',
    snippet: '普济寺、南海观音、朱家尖沙滩',
    keywords: ['舟山', '普陀山', '朱家尖', '观音'],
    content: `第1天
- 普陀山
- 普济寺
- 南海观音立像

第2天
- 慧济寺
- 朱家尖南沙景区
- 沈家门渔港`,
  },
  {
    id: 'guide-weihai-2d',
    title: '威海2日海滨休闲',
    author: '齐鲁行者',
    cover: '/covers/default.jpg',
    destination: '威海',
    days: 2,
    category: '滨海',
    likes: '1.4w',
    snippet: '刘公岛历史 + 国际海水浴场',
    keywords: ['威海', '刘公岛', '成山头', '海滨'],
    content: `第1天
- 刘公岛
- 甲午战争博物馆
- 威海国际海水浴场

第2天
- 成山头风景区
- 海驴岛
- 幸福门`,
  },
  {
    id: 'guide-jinan-2d',
    title: '济南2日泉城经典',
    author: '齐鲁行者',
    cover: '/covers/default.jpg',
    destination: '济南',
    days: 2,
    category: '人文',
    likes: '1.3w',
    snippet: '趵突泉 + 大明湖 + 千佛山',
    keywords: ['济南', '趵突泉', '大明湖', '千佛山'],
    content: `第1天
- 趵突泉
- 大明湖
- 超然楼

第2天
- 千佛山
- 山东博物馆
- 芙蓉街`,
  },
  {
    id: 'guide-changbaishan-2d',
    title: '长白山2日天池之旅',
    author: '东北行记',
    cover: '/covers/default.jpg',
    destination: '长白山',
    days: 2,
    category: '自然',
    likes: '2.6w',
    snippet: '北坡天池 + 长白瀑布经典线',
    keywords: ['长白山', '天池', '长白瀑布', '延边'],
    content: `第1天
- 长白山北坡
- 天池
- 长白瀑布

第2天
- 地下森林
- 绿渊潭
- 魔界漂流`,
  },
  {
    id: 'guide-xining-qinghai-3d',
    title: '青海湖3日环湖｜茶卡盐湖',
    author: '西北行记',
    cover: '/covers/default.jpg',
    destination: '青海湖',
    days: 3,
    category: '自然',
    likes: '3.2w',
    snippet: '二郎剑、茶卡天空之镜、塔尔寺',
    keywords: ['青海湖', '茶卡盐湖', '塔尔寺', '西宁'],
    content: `第1天
- 塔尔寺
- 日月山
- 倒淌河

第2天
- 青海湖二郎剑景区
- 黑马河乡

第3天
- 茶卡盐湖
- 茶卡镇`,
  },
  {
    id: 'guide-zhangye-2d',
    title: '张掖2日七彩丹霞',
    author: '西北行记',
    cover: '/covers/default.jpg',
    destination: '张掖',
    days: 2,
    category: '自然',
    likes: '2.4w',
    snippet: '七彩丹霞日落 + 大佛寺',
    keywords: ['张掖', '七彩丹霞', '大佛寺', '甘肃'],
    content: `第1天
- 张掖七彩丹霞旅游景区
- 冰沟丹霞

第2天
- 大佛寺
- 马蹄寺
- 张掖国家湿地公园`,
  },
  {
    id: 'guide-huashan-2d',
    title: '华山2日险峻登山',
    author: '关中行者',
    cover: '/covers/default.jpg',
    destination: '华山',
    days: 2,
    category: '自然',
    likes: '2.8w',
    snippet: '西峰索道上下，长空栈道可选',
    keywords: ['华山', '西峰', '长空栈道', '渭南'],
    content: `第1天
- 华山游客中心
- 西峰索道
- 西峰

第2天
- 南峰
- 东峰
- 北峰`,
  },
  {
    id: 'guide-wudangshan-2d',
    title: '武当山2日道教名山',
    author: '荆楚行记',
    cover: '/covers/default.jpg',
    destination: '武当山',
    days: 2,
    category: '人文',
    likes: '1.9w',
    snippet: '金顶、太子坡、紫霄宫经典线',
    keywords: ['武当山', '金顶', '太子坡', '十堰'],
    content: `第1天
- 太子坡
- 紫霄宫
- 南岩宫

第2天
- 金顶
- 金殿
- 乌鸦岭`,
  },
  {
    id: 'guide-enshi-2d',
    title: '恩施2日峡谷秘境',
    author: '鄂西行记',
    cover: '/covers/default.jpg',
    destination: '恩施',
    days: 2,
    category: '自然',
    likes: '2.1w',
    snippet: '大峡谷 + 土司城，屏山峡谷可选',
    keywords: ['恩施', '大峡谷', '土司城', '屏山'],
    content: `第1天
- 恩施大峡谷
- 云龙地缝
- 七星寨

第2天
- 恩施土司城
- 女儿城
- 梭布垭石林`,
  },
  {
    id: 'guide-yichang-2d',
    title: '宜昌2日三峡大坝',
    author: '荆楚行记',
    cover: '/covers/default.jpg',
    destination: '宜昌',
    days: 2,
    category: '人文',
    likes: '1.6w',
    snippet: '三峡大坝 + 三峡人家',
    keywords: ['宜昌', '三峡大坝', '三峡人家', '葛洲坝'],
    content: `第1天
- 三峡大坝
- 坛子岭
- 185平台

第2天
- 三峡人家
- 清江画廊
- 葛洲坝`,
  },
  {
    id: 'guide-wuyuan-2d',
    title: '婺源2日油菜花季',
    author: '赣东北行记',
    cover: '/covers/default.jpg',
    destination: '婺源',
    days: 2,
    category: '古镇',
    likes: '2.5w',
    snippet: '篁岭晒秋 + 江湾李坑',
    keywords: ['婺源', '篁岭', '江湾', '油菜花'],
    content: `第1天
- 篁岭
- 晒秋平台
- 垒心桥

第2天
- 江湾景区
- 李坑
- 汪口`,
  },
  {
    id: 'guide-jingdezhen-2d',
    title: '景德镇2日陶瓷之旅',
    author: '赣东北行记',
    cover: '/covers/default.jpg',
    destination: '景德镇',
    days: 2,
    category: '人文',
    likes: '1.4w',
    snippet: '古窑民俗 + 陶溪川文创',
    keywords: ['景德镇', '陶瓷', '古窑', '陶溪川'],
    content: `第1天
- 古窑民俗博览区
- 瑶里古镇

第2天
- 陶溪川文创街区
- 中国陶瓷博物馆
- 御窑厂遗址`,
  },
  {
    id: 'guide-lushan-2d',
    title: '庐山2日避暑牯岭',
    author: '赣东北行记',
    cover: '/covers/default.jpg',
    destination: '庐山',
    days: 2,
    category: '自然',
    likes: '2.0w',
    snippet: '牯岭镇 + 含鄱口 + 三叠泉',
    keywords: ['庐山', '牯岭', '含鄱口', '三叠泉'],
    content: `第1天
- 牯岭镇
- 如琴湖
- 花径
- 美庐别墅

第2天
- 含鄱口
- 五老峰
- 三叠泉`,
  },
  {
    id: 'guide-xishuangbanna-3d',
    title: '西双版纳3日热带风情',
    author: '滇南行记',
    cover: '/covers/default.jpg',
    destination: '西双版纳',
    days: 3,
    category: '自然',
    likes: '2.9w',
    snippet: '野象谷 + 植物园 + 告庄夜市',
    keywords: ['西双版纳', '野象谷', '植物园', '告庄'],
    content: `第1天
- 野象谷
- 原始森林公园

第2天
- 中国科学院西双版纳热带植物园
- 曼听公园

第3天
- 告庄西双景
- 星光夜市
- 总佛寺`,
  },
  {
    id: 'guide-tengchong-2d',
    title: '腾冲2日温泉古镇',
    author: '滇西行记',
    cover: '/covers/default.jpg',
    destination: '腾冲',
    days: 2,
    category: '人文',
    likes: '1.8w',
    snippet: '热海温泉 + 和顺古镇',
    keywords: ['腾冲', '热海', '和顺古镇', '温泉'],
    content: `第1天
- 热海景区
- 大滚锅
- 和顺古镇

第2天
- 国殇墓园
- 北海湿地
- 滇西抗战纪念馆`,
  },
  {
    id: 'guide-shangrila-3d',
    title: '香格里拉3日藏区秘境',
    author: '滇西行记',
    cover: '/covers/default.jpg',
    destination: '香格里拉',
    days: 3,
    category: '自然',
    likes: '2.3w',
    snippet: '普达措 + 松赞林寺 + 独克宗',
    keywords: ['香格里拉', '普达措', '松赞林寺', '独克宗'],
    content: `第1天
- 独克宗古城
- 龟山公园
- 转经筒

第2天
- 普达措国家公园
- 属都湖

第3天
- 松赞林寺
- 纳帕海
- 依拉草原`,
  },
  {
    id: 'guide-beihai-2d',
    title: '北海2日银滩涠洲',
    author: '北部湾行记',
    cover: '/covers/default.jpg',
    destination: '北海',
    days: 2,
    category: '滨海',
    likes: '2.2w',
    snippet: '银滩日落 + 涠洲岛火山岛',
    keywords: ['北海', '银滩', '涠洲岛', '老街'],
    content: `第1天
- 北海银滩
- 侨港风情街
- 北海老街

第2天
- 涠洲岛
- 鳄鱼山火山公园
- 石螺口海滩`,
  },
  {
    id: 'guide-chaozhou-2d',
    title: '潮州2日古城美食',
    author: '粤东行记',
    cover: '/covers/default.jpg',
    destination: '潮州',
    days: 2,
    category: '美食',
    likes: '1.7w',
    snippet: '牌坊街 + 广济桥 + 牛肉火锅',
    keywords: ['潮州', '牌坊街', '广济桥', '美食'],
    content: `第1天
- 牌坊街
- 开元寺
- 广济桥

第2天
- 韩文公祠
- 西湖公园
- 泰佛殿`,
  },
  {
    id: 'guide-zhuhai-2d',
    title: '珠海2日情侣路长隆',
    author: '粤西行记',
    cover: '/covers/default.jpg',
    destination: '珠海',
    days: 2,
    category: '亲子',
    likes: '2.0w',
    snippet: '情侣路 + 长隆海洋王国',
    keywords: ['珠海', '情侣路', '长隆', '渔女'],
    content: `第1天
- 情侣路
- 珠海渔女
- 珠海大剧院

第2天
- 珠海长隆海洋王国
- 横琴岛`,
  },
  {
    id: 'guide-quanzhou-2d',
    title: '泉州2日世遗古城',
    author: '闽南都行',
    cover: '/covers/default.jpg',
    destination: '泉州',
    days: 2,
    category: '人文',
    likes: '2.4w',
    snippet: '开元寺、西街、清源山经典线',
    keywords: ['泉州', '开元寺', '西街', '世遗'],
    content: `第1天
- 开元寺
- 西街
- 钟楼
- 关岳庙

第2天
- 清源山
- 老君岩
- 崇武古城`,
  },
  {
    id: 'guide-chongqing-wulong-2d',
    title: '重庆2日武隆天坑',
    author: '山城笔记',
    cover: '/covers/default.jpg',
    destination: '重庆',
    days: 2,
    category: '自然',
    likes: '2.6w',
    snippet: '天生三桥 + 仙女山，市区解放碑搭配',
    keywords: ['重庆', '武隆', '天生三桥', '仙女山'],
    content: `第1天
- 解放碑步行街
- 洪崖洞
- 长江索道

第2天
- 武隆天生三桥
- 龙水峡地缝
- 仙女山国家森林公园`,
  },
  {
    id: 'guide-hangzhou-qiandao-2d',
    title: '杭州2日千岛湖度假',
    author: '浙西行记',
    cover: '/covers/default.jpg',
    destination: '杭州',
    days: 2,
    category: '自然',
    likes: '1.9w',
    snippet: '千岛湖游船 + 森林氧吧',
    keywords: ['杭州', '千岛湖', '淳安', '度假'],
    content: `第1天
- 千岛湖中心湖区
- 梅峰观岛
- 月光岛

第2天
- 千岛湖东南湖区
- 森林氧吧
- 文渊狮城`,
  },
];
