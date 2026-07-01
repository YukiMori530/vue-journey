import type { TravelGuideSeed } from './guides.seed-data';

/** 各省会及热门目的地补充攻略（覆盖 34 省级行政区代表城市） */
export const provinceGuideSeeds: TravelGuideSeed[] = [
  {
    id: 'guide-tianjin-2d',
    title: '天津2日海河风情｜意式区与眼',
    author: '津门行记',
    cover: '/covers/discover-city.jpg',
    destination: '天津',
    days: 2,
    category: '人文',
    likes: '2.1w',
    snippet: '天津之眼 + 意式风情区 + 古文化街',
    keywords: ['天津', '海河', '意式风情区', '天津之眼'],
    content: `第1天
- 天津之眼
- 意式风情区
- 五大道

第2天
- 古文化街
- 瓷房子
- 海河游船`,
  },
  {
    id: 'guide-shijiazhuang-2d',
    title: '石家庄2日｜正定古城慢游',
    author: '燕赵行记',
    cover: '/covers/discover-city.jpg',
    destination: '石家庄',
    days: 2,
    category: '人文',
    likes: '1.4w',
    snippet: '正定古城 + 隆兴寺 + 荣国府',
    keywords: ['石家庄', '正定', '古城', '河北'],
    content: `第1天
- 正定古城
- 隆兴寺
- 阳和楼

第2天
- 荣国府
- 赵云庙
- 滹沱河生态公园`,
  },
  {
    id: 'guide-baoding-2d',
    title: '保定2日直隶文化线',
    author: '燕赵行记',
    cover: '/covers/discover-food.jpg',
    destination: '保定',
    days: 2,
    category: '人文',
    likes: '1.1w',
    snippet: '直隶总督署 + 白洋淀 + 驴肉火烧',
    keywords: ['保定', '直隶总督署', '白洋淀', '驴肉火烧'],
    content: `第1天
- 直隶总督署
- 古莲花池
- 保定军校纪念馆

第2天
- 白洋淀
- 雄安新区展示中心`,
  },
  {
    id: 'guide-taiyuan-2d',
    title: '太原2日晋商古韵',
    author: '三晋行记',
    cover: '/covers/default.jpg',
    destination: '太原',
    days: 2,
    category: '人文',
    likes: '1.5w',
    snippet: '晋祠 + 山西博物院 + 双塔寺',
    keywords: ['太原', '晋祠', '山西博物院', '晋商'],
    content: `第1天
- 晋祠
- 山西博物院
- 双塔寺

第2天
- 平遥古城
- 日升昌票号`,
  },
  {
    id: 'guide-datong-2d',
    title: '大同2日云冈石窟',
    author: '三晋行记',
    cover: '/covers/default.jpg',
    destination: '大同',
    days: 2,
    category: '人文',
    likes: '2.3w',
    snippet: '云冈石窟 + 华严寺 + 悬空寺',
    keywords: ['大同', '云冈石窟', '悬空寺', '华严寺'],
    content: `第1天
- 云冈石窟
- 华严寺
- 九龙壁

第2天
- 悬空寺
- 恒山`,
  },
  {
    id: 'guide-hohhot-2d',
    title: '呼和浩特2日草原门户',
    author: '草原行记',
    cover: '/covers/default.jpg',
    destination: '呼和浩特',
    days: 2,
    category: '人文',
    likes: '1.4w',
    snippet: '大召寺 + 内蒙古博物院 + 昭君墓',
    keywords: ['呼和浩特', '大召寺', '内蒙古', '草原'],
    content: `第1天
- 大召寺
- 席力图召
- 塞上老街

第2天
- 内蒙古博物院
- 昭君墓`,
  },
  {
    id: 'guide-shenyang-2d',
    title: '沈阳2日盛京故宫',
    author: '东北行记',
    cover: '/covers/default.jpg',
    destination: '沈阳',
    days: 2,
    category: '人文',
    likes: '1.8w',
    snippet: '沈阳故宫 + 中街 + 北陵公园',
    keywords: ['沈阳', '故宫', '中街', '东北'],
    content: `第1天
- 沈阳故宫
- 中街
- 刘老根大舞台

第2天
- 北陵公园
- 辽宁省博物馆`,
  },
  {
    id: 'guide-dalian-2d',
    title: '大连2日海滨浪漫',
    author: '东北行记',
    cover: '/covers/default.jpg',
    destination: '大连',
    days: 2,
    category: '滨海',
    likes: '2.5w',
    snippet: '星海广场 + 老虎滩 + 金石滩',
    keywords: ['大连', '星海广场', '海滨', '老虎滩'],
    content: `第1天
- 星海广场
- 滨海路
- 老虎滩海洋公园

第2天
- 金石滩
- 棒棰岛`,
  },
  {
    id: 'guide-changchun-2d',
    title: '长春2日电影之城',
    author: '东北行记',
    cover: '/covers/default.jpg',
    destination: '长春',
    days: 2,
    category: '人文',
    likes: '1.3w',
    snippet: '伪满皇宫 + 净月潭 + 长影世纪城',
    keywords: ['长春', '伪满皇宫', '净月潭', '电影'],
    content: `第1天
- 伪满皇宫博物院
- 南湖公园

第2天
- 净月潭
- 长影世纪城`,
  },
  {
    id: 'guide-jilin-rime-2d',
    title: '吉林2日雾凇奇观',
    author: '东北行记',
    cover: '/covers/default.jpg',
    destination: '吉林',
    days: 2,
    category: '自然',
    likes: '1.9w',
    snippet: '雾凇岛 + 松花湖 + 北山',
    keywords: ['吉林', '雾凇岛', '松花湖', '雾凇'],
    content: `第1天
- 雾凇岛
- 韩屯村

第2天
- 松花湖
- 北山公园`,
  },
  {
    id: 'guide-hefei-2d',
    title: '合肥2日徽风皖韵',
    author: '江淮行记',
    cover: '/covers/default.jpg',
    destination: '合肥',
    days: 2,
    category: '人文',
    likes: '1.2w',
    snippet: '包公园 + 三河古镇 + 李鸿章故居',
    keywords: ['合肥', '包公园', '三河古镇', '安徽'],
    content: `第1天
- 包公园
- 李鸿章故居
- 安徽省博物馆

第2天
- 三河古镇
- 逍遥津公园`,
  },
  {
    id: 'guide-wenzhou-2d',
    title: '温州2日雁荡山水',
    author: '浙南行记',
    cover: '/covers/default.jpg',
    destination: '温州',
    days: 2,
    category: '自然',
    likes: '1.6w',
    snippet: '雁荡山 + 江心屿 + 楠溪江',
    keywords: ['温州', '雁荡山', '楠溪江', '浙江'],
    content: `第1天
- 雁荡山
- 灵峰景区
- 大龙湫

第2天
- 江心屿
- 五马街`,
  },
  {
    id: 'guide-taizhou-2d',
    title: '台州2日神仙居天台山',
    author: '浙东行记',
    cover: '/covers/default.jpg',
    destination: '台州',
    days: 2,
    category: '自然',
    likes: '1.4w',
    snippet: '天台山国清寺 + 神仙居',
    keywords: ['台州', '天台山', '神仙居', '浙江'],
    content: `第1天
- 天台山
- 国清寺

第2天
- 神仙居
- 台州府城墙`,
  },
  {
    id: 'guide-xuzhou-2d',
    title: '徐州2日汉文化之旅',
    author: '淮海行记',
    cover: '/covers/default.jpg',
    destination: '徐州',
    days: 2,
    category: '人文',
    likes: '1.1w',
    snippet: '云龙湖 + 龟山汉墓 + 徐州博物馆',
    keywords: ['徐州', '云龙湖', '汉文化', '江苏'],
    content: `第1天
- 云龙湖
- 徐州博物馆

第2天
- 龟山汉墓
- 户部山`,
  },
  {
    id: 'guide-kaifeng-2d',
    title: '开封2日北宋古都',
    author: '中原行者',
    cover: '/covers/default.jpg',
    destination: '开封',
    days: 2,
    category: '人文',
    likes: '2.0w',
    snippet: '清明上河园 + 开封府 + 大相国寺',
    keywords: ['开封', '清明上河园', '北宋', '河南'],
    content: `第1天
- 清明上河园
- 开封府

第2天
- 大相国寺
- 龙亭公园
- 鼓楼夜市`,
  },
  {
    id: 'guide-hengyang-2d',
    title: '衡阳2日南岳衡山',
    author: '湘中行记',
    cover: '/covers/default.jpg',
    destination: '衡阳',
    days: 2,
    category: '自然',
    likes: '1.7w',
    snippet: '南岳衡山 + 祝融峰 + 石鼓书院',
    keywords: ['衡阳', '衡山', '南岳', '湖南'],
    content: `第1天
- 南岳衡山
- 南岳大庙

第2天
- 祝融峰
- 石鼓书院`,
  },
  {
    id: 'guide-fenghuang-2d',
    title: '凤凰2日沱江古城',
    author: '湘西行记',
    cover: '/covers/default.jpg',
    destination: '凤凰',
    days: 2,
    category: '古镇',
    likes: '3.2w',
    snippet: '凤凰古城夜景 + 沱江泛舟 + 虹桥',
    keywords: ['凤凰', '凤凰古城', '沱江', '湘西'],
    content: `第1天
- 凤凰古城
- 沱江
- 虹桥

第2天
- 南方长城
- 沈从文故居`,
  },
  {
    id: 'guide-nanning-2d',
    title: '南宁2日绿城风情',
    author: '壮乡行记',
    cover: '/covers/default.jpg',
    destination: '南宁',
    days: 2,
    category: '人文',
    likes: '1.3w',
    snippet: '青秀山 + 民族博物馆 + 中山路',
    keywords: ['南宁', '青秀山', '广西', '绿城'],
    content: `第1天
- 青秀山
- 广西民族博物馆

第2天
- 南湖公园
- 中山路美食街`,
  },
  {
    id: 'guide-liuzhou-2d',
    title: '柳州2日螺蛳粉之旅',
    author: '壮乡行记',
    cover: '/covers/default.jpg',
    destination: '柳州',
    days: 2,
    category: '美食',
    likes: '1.8w',
    snippet: '柳侯公园 + 马鞍山 + 窑埠古镇',
    keywords: ['柳州', '螺蛳粉', '广西', '美食'],
    content: `第1天
- 柳侯公园
- 马鞍山

第2天
- 窑埠古镇
- 五星步行街`,
  },
  {
    id: 'guide-shantou-2d',
    title: '汕头2日南澳海岛',
    author: '粤东行记',
    cover: '/covers/default.jpg',
    destination: '汕头',
    days: 2,
    category: '滨海',
    likes: '1.5w',
    snippet: '小公园 + 南澳岛 + 牛肉火锅',
    keywords: ['汕头', '南澳岛', '小公园', '潮汕'],
    content: `第1天
- 小公园
- 汕头开埠文化陈列馆

第2天
- 南澳岛
- 青澳湾`,
  },
  {
    id: 'guide-foshan-2d',
    title: '佛山2日岭南文化',
    author: '粤西行记',
    cover: '/covers/default.jpg',
    destination: '佛山',
    days: 2,
    category: '人文',
    likes: '1.6w',
    snippet: '祖庙 + 岭南天地 + 西樵山',
    keywords: ['佛山', '祖庙', '岭南', '广东'],
    content: `第1天
- 祖庙
- 岭南天地

第2天
- 西樵山
- 南风古灶`,
  },
  {
    id: 'guide-zhanjiang-2d',
    title: '湛江2日海湾度假',
    author: '粤西行记',
    cover: '/covers/default.jpg',
    destination: '湛江',
    days: 2,
    category: '滨海',
    likes: '1.2w',
    snippet: '湖光岩 + 金沙湾 + 特呈岛',
    keywords: ['湛江', '湖光岩', '海滨', '广东'],
    content: `第1天
- 湖光岩
- 金沙湾

第2天
- 特呈岛
- 霞山观海长廊`,
  },
  {
    id: 'guide-mianyang-2d',
    title: '绵阳2日李白故里',
    author: '蜀山笔记',
    cover: '/covers/default.jpg',
    destination: '绵阳',
    days: 2,
    category: '人文',
    likes: '1.1w',
    snippet: '李白故里 + 九皇山 + 越王楼',
    keywords: ['绵阳', '李白', '四川', '九皇山'],
    content: `第1天
- 李白故里
- 江油窦圌山

第2天
- 九皇山
- 越王楼`,
  },
  {
    id: 'guide-yibin-2d',
    title: '宜宾2日竹海李庄',
    author: '蜀山笔记',
    cover: '/covers/default.jpg',
    destination: '宜宾',
    days: 2,
    category: '自然',
    likes: '1.4w',
    snippet: '蜀南竹海 + 李庄古镇 + 五粮液',
    keywords: ['宜宾', '蜀南竹海', '李庄', '四川'],
    content: `第1天
- 蜀南竹海
- 忘忧谷

第2天
- 李庄古镇
- 五粮液景区`,
  },
  {
    id: 'guide-zunyi-2d',
    title: '遵义2日红色酒都',
    author: '黔行记',
    cover: '/covers/default.jpg',
    destination: '遵义',
    days: 2,
    category: '人文',
    likes: '1.6w',
    snippet: '遵义会议会址 + 茅台镇 + 赤水',
    keywords: ['遵义', '茅台', '红色旅游', '贵州'],
    content: `第1天
- 遵义会议会址
- 红军山

第2天
- 茅台镇
- 赤水丹霞`,
  },
  {
    id: 'guide-kaili-2d',
    title: '凯里2日苗寨古镇',
    author: '黔行记',
    cover: '/covers/default.jpg',
    destination: '凯里',
    days: 2,
    category: '人文',
    likes: '2.2w',
    snippet: '西江千户苗寨 + 镇远古镇',
    keywords: ['凯里', '西江千户苗寨', '镇远', '贵州'],
    content: `第1天
- 西江千户苗寨
- 观景台

第2天
- 镇远古镇
- 青龙洞`,
  },
  {
    id: 'guide-lanzhou-2d',
    title: '兰州2日黄河风情',
    author: '陇上行记',
    cover: '/covers/default.jpg',
    destination: '兰州',
    days: 2,
    category: '人文',
    likes: '1.5w',
    snippet: '中山桥 + 甘肃省博 + 正宁路夜市',
    keywords: ['兰州', '中山桥', '牛肉面', '甘肃'],
    content: `第1天
- 中山桥
- 白塔山
- 甘肃省博物馆

第2天
- 正宁路夜市
- 水车博览园`,
  },
  {
    id: 'guide-tianshui-2d',
    title: '天水2日麦积石窟',
    author: '陇上行记',
    cover: '/covers/default.jpg',
    destination: '天水',
    days: 2,
    category: '人文',
    likes: '1.3w',
    snippet: '麦积山石窟 + 伏羲庙 + 南郭寺',
    keywords: ['天水', '麦积山', '石窟', '甘肃'],
    content: `第1天
- 麦积山石窟
- 仙人崖

第2天
- 伏羲庙
- 南郭寺`,
  },
  {
    id: 'guide-jiayuguan-2d',
    title: '嘉峪关2日长城西端',
    author: '陇上行记',
    cover: '/covers/default.jpg',
    destination: '嘉峪关',
    days: 2,
    category: '人文',
    likes: '1.4w',
    snippet: '嘉峪关关城 + 悬壁长城 + 第一墩',
    keywords: ['嘉峪关', '长城', '关城', '甘肃'],
    content: `第1天
- 嘉峪关关城
- 悬壁长城

第2天
- 长城第一墩
- 魏晋壁画墓`,
  },
  {
    id: 'guide-yinchuan-2d',
    title: '银川2日西夏探秘',
    author: '塞上行记',
    cover: '/covers/default.jpg',
    destination: '银川',
    days: 2,
    category: '人文',
    likes: '1.5w',
    snippet: '西夏王陵 + 镇北堡影城 + 贺兰山岩画',
    keywords: ['银川', '西夏', '镇北堡', '宁夏'],
    content: `第1天
- 西夏王陵
- 贺兰山岩画

第2天
- 镇北堡西部影城
- 水洞沟`,
  },
  {
    id: 'guide-zhongwei-2d',
    title: '中卫2日沙坡头',
    author: '塞上行记',
    cover: '/covers/default.jpg',
    destination: '中卫',
    days: 2,
    category: '自然',
    likes: '1.8w',
    snippet: '沙坡头滑沙 + 黄河漂流 + 沙漠星空',
    keywords: ['中卫', '沙坡头', '沙漠', '宁夏'],
    content: `第1天
- 沙坡头
- 黄河漂流

第2天
- 高庙
- 腾格里沙漠`,
  },
  {
    id: 'guide-urumqi-3d',
    title: '乌鲁木齐3日天山南北',
    author: '西域行记',
    cover: '/covers/default.jpg',
    destination: '乌鲁木齐',
    days: 3,
    category: '自然',
    likes: '2.1w',
    snippet: '天山天池 + 国际大巴扎 + 新疆博物馆',
    keywords: ['乌鲁木齐', '天山天池', '新疆', '大巴扎'],
    content: `第1天
- 新疆维吾尔自治区博物馆
- 国际大巴扎
- 红山公园

第2天
- 天山天池
- 西小天池

第3天
- 南山牧场
- 新疆民俗街`,
  },
  {
    id: 'guide-kashgar-2d',
    title: '喀什2日南疆风情',
    author: '西域行记',
    cover: '/covers/default.jpg',
    destination: '喀什',
    days: 2,
    category: '人文',
    likes: '1.9w',
    snippet: '喀什古城 + 艾提尕尔清真寺 + 香妃墓',
    keywords: ['喀什', '古城', '新疆', '南疆'],
    content: `第1天
- 喀什古城
- 艾提尕尔清真寺

第2天
- 香妃墓
- 高台民居`,
  },
  {
    id: 'guide-yili-3d',
    title: '伊犁3日草原花海',
    author: '西域行记',
    cover: '/covers/default.jpg',
    destination: '伊犁',
    days: 3,
    category: '自然',
    likes: '2.4w',
    snippet: '那拉提草原 + 赛里木湖 + 喀赞其',
    keywords: ['伊犁', '那拉提', '赛里木湖', '新疆'],
    content: `第1天
- 赛里木湖
- 果子沟大桥

第2天
- 那拉提草原
- 空中草原

第3天
- 喀赞其民俗街
- 伊犁河`,
  },
  {
    id: 'guide-xining-2d',
    title: '西宁2日高原门户',
    author: '西北行记',
    cover: '/covers/default.jpg',
    destination: '西宁',
    days: 2,
    category: '人文',
    likes: '1.4w',
    snippet: '塔尔寺 + 东关清真大寺 + 青海省博',
    keywords: ['西宁', '塔尔寺', '青海', '高原'],
    content: `第1天
- 塔尔寺
- 青海省博物馆

第2天
- 东关清真大寺
- 北山土楼观`,
  },
  {
    id: 'guide-linzhi-3d',
    title: '林芝3日藏地江南',
    author: '藏地行记',
    cover: '/covers/default.jpg',
    destination: '林芝',
    days: 3,
    category: '自然',
    likes: '2.0w',
    snippet: '雅鲁藏布大峡谷 + 南迦巴瓦 + 巴松措',
    keywords: ['林芝', '南迦巴瓦', '大峡谷', '西藏'],
    content: `第1天
- 雅鲁藏布大峡谷
- 南迦巴瓦峰观景台

第2天
- 巴松措
- 新措

第3天
- 鲁朗林海
- 鲁朗小镇`,
  },
  {
    id: 'guide-tangshan-2d',
    title: '唐山2日工业遗产',
    author: '燕赵行记',
    cover: '/covers/default.jpg',
    destination: '唐山',
    days: 2,
    category: '人文',
    likes: '1.0w',
    snippet: '南湖公园 + 清东陵 + 抗震纪念馆',
    keywords: ['唐山', '南湖', '清东陵', '河北'],
    content: `第1天
- 唐山南湖公园
- 唐山抗震纪念馆

第2天
- 清东陵
- 滦州古城`,
  },
  {
    id: 'guide-zhangjiakou-2d',
    title: '张家口2日冬奥之城',
    author: '燕赵行记',
    cover: '/covers/default.jpg',
    destination: '张家口',
    days: 2,
    category: '自然',
    likes: '1.6w',
    snippet: '崇礼滑雪 + 草原天路 + 大境门',
    keywords: ['张家口', '崇礼', '草原天路', '冬奥'],
    content: `第1天
- 大境门
- 张家口堡

第2天
- 崇礼滑雪场
- 草原天路`,
  },
  {
    id: 'guide-huzhou-2d',
    title: '湖州2日莫干山度假',
    author: '江南行记',
    cover: '/covers/default.jpg',
    destination: '湖州',
    days: 2,
    category: '自然',
    likes: '1.7w',
    snippet: '莫干山民宿 + 南浔古镇 + 太湖',
    keywords: ['湖州', '莫干山', '南浔', '浙江'],
    content: `第1天
- 莫干山
- 庾村

第2天
- 南浔古镇
- 太湖旅游度假区`,
  },
  {
    id: 'guide-jiaxing-2d',
    title: '嘉兴2日水乡古镇',
    author: '江南行记',
    cover: '/covers/default.jpg',
    destination: '嘉兴',
    days: 2,
    category: '古镇',
    likes: '1.5w',
    snippet: '西塘古镇 + 南湖 + 月河',
    keywords: ['嘉兴', '西塘', '南湖', '浙江'],
    content: `第1天
- 西塘古镇
- 烟雨长廊

第2天
- 南湖
- 月河历史街区`,
  },
  {
    id: 'guide-haikou-2d',
    title: '海口2日骑楼老街',
    author: '琼岛行记',
    cover: '/covers/hainan.jpg',
    destination: '海口',
    days: 2,
    category: '人文',
    likes: '1.4w',
    snippet: '骑楼老街 + 假日海滩 + 火山群',
    keywords: ['海口', '骑楼', '海南', '海滨'],
    content: `第1天
- 骑楼老街
- 假日海滩
- 万绿园

第2天
- 雷琼海口火山群
- 海南省博物馆`,
  },
  {
    id: 'guide-xiamen-gulangyu-2d',
    title: '厦门2日鼓浪屿深度',
    author: '闽南都行',
    cover: '/covers/default.jpg',
    destination: '厦门',
    days: 2,
    category: '滨海',
    likes: '3.1w',
    snippet: '鼓浪屿 + 曾厝垵 + 南普陀',
    keywords: ['厦门', '鼓浪屿', '曾厝垵', '福建'],
    content: `第1天
- 鼓浪屿
- 日光岩
- 菽庄花园

第2天
- 南普陀寺
- 厦门大学
- 曾厝垵`,
  },
];
