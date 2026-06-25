export interface GeoPoint {
  lng: number
  lat: number
}

export const MAX_CITY_STOP_KM = 20
export const MAX_CLUSTER_JUMP_KM = 18
export const MAX_REMOTE_LANDMARK_KM = 95
export const MIN_STOP_SEPARATION_KM = 0.12
export const MAX_URBAN_FROM_CENTER_KM = 45
export const MAX_REMOTE_FROM_CENTER_KM = 120
export const MIN_POI_NAME_SCORE = 4

/** 省/自治区级目的地：需从景点名推断具体城市 */
const WIDE_AREA_DEST_RE =
  /^(?:河北|河南|山东|山西|陕西|甘肃|云南|贵州|四川|广东|广西|湖南|湖北|江西|安徽|江苏|浙江|福建|辽宁|吉林|黑龙江|内蒙古|新疆|西藏|宁夏|青海|海南)$/

const STOP_CITY_HINTS: Array<{ key: string; city: string }> = [
  { key: '北戴河', city: '秦皇岛' },
  { key: '山海关', city: '秦皇岛' },
  { key: '老龙头', city: '秦皇岛' },
  { key: '鸽子窝', city: '秦皇岛' },
  { key: '老虎石', city: '秦皇岛' },
  { key: '秦皇岛', city: '秦皇岛' },
  { key: '避暑山庄', city: '承德' },
  { key: '普宁寺', city: '承德' },
  { key: '普陀宗乘', city: '承德' },
  { key: '磬锤峰', city: '承德' },
  { key: '二仙居', city: '承德' },
  { key: '承德', city: '承德' },
  { key: '石家庄', city: '石家庄' },
  { key: '正定', city: '石家庄' },
  { key: '赵州桥', city: '石家庄' },
  { key: '野三坡', city: '保定' },
  { key: '白洋淀', city: '保定' },
  { key: '保定', city: '保定' },
  { key: '崇礼', city: '张家口' },
  { key: '张家口', city: '张家口' },
  { key: '唐山', city: '唐山' },
  { key: '后海村', city: '三亚' },
  { key: '蜈支洲', city: '三亚' },
  { key: '海棠湾', city: '三亚' },
  { key: '坛南湾', city: '平潭' },
  { key: '北港村', city: '平潭' },
  { key: '长江澳', city: '平潭' },
  { key: '猴研岛', city: '平潭' },
  { key: '平潭岛', city: '平潭' },
  { key: '平潭', city: '平潭' },
].sort((a, b) => b.key.length - a.key.length)

export function isWideAreaDestination(destination: string): boolean {
  const region = extractDestinationRegion(destination)
  return WIDE_AREA_DEST_RE.test(region) || /(?:省|自治区)$/.test(destination.trim())
}

/** 从「河北经典三日游…」等标题提取省级/城市级目的地 */
export function extractDestinationRegion(destination: string): string {
  const trimmed = destination.trim()
  for (const province of [
    '河北', '河南', '山东', '山西', '陕西', '甘肃', '云南', '贵州', '四川',
    '广东', '广西', '湖南', '湖北', '江西', '安徽', '江苏', '浙江', '福建',
    '辽宁', '吉林', '黑龙江', '内蒙古', '新疆', '西藏', '宁夏', '青海', '海南',
  ]) {
    if (trimmed.startsWith(province)) {
      return province
    }
  }
  return normalizeCityName(trimmed)
}

/** 从景点名推断所在城市（跨省行程 / 省级目的地） */
export function inferStopCity(name: string, destination: string): string {
  const primary = primaryPlaceName(name)
  for (const { key, city } of STOP_CITY_HINTS) {
    if (primary.includes(key)) {
      return normalizeCityName(city)
    }
  }
  return normalizeCityName(destination) || destination
}

export function resolveStopGeoContext(
  stopName: string,
  destination: string,
  tripCityCenter: GeoPoint | null,
): { stopCity: string; center: GeoPoint | null } {
  const stopCity = inferStopCity(stopName, destination)
  const tripRegion = extractDestinationRegion(destination)
  if (stopCity !== tripRegion) {
    return { stopCity, center: defaultCityCenter(stopCity) }
  }
  return { stopCity, center: tripCityCenter ?? defaultCityCenter(stopCity) }
}

const REMOTE_EXCURSION_RE =
  /八达岭|慕田峪|居庸关|司马台|金山岭|古北口|十渡|明十三陵|十三陵|潭柘寺|红螺寺|青龙峡|古北水镇|雁栖湖|云蒙山|雾灵山|兵马俑|华清宫|乾陵|法门寺|阳关|玉门关|雅丹|魔鬼城|玉龙雪山|蓝月谷|泸沽湖|天门山|天子山|袁家界|武陵源|张家界国家森林公园|阳朔|十里画廊|蜈支洲岛|天涯海角|南山文化旅游区|后海村|亚龙湾|海棠湾|西岛|大东海|鹿回头|养马岛|蓬莱阁|华山|泰山|黄山|峨眉山|青城山|都江堰|千岛湖|赛里木湖|喀纳斯|禾木|那拉提|抚仙湖|抚仙|洱海双廊|双廊古镇|束河古镇|白沙古镇/

const POI_SHUTTLE_RE = /直通车|专线|乘车点|上车点|发车点|旅游集散|集散中心/

const NON_ATTRACTION_RE =
  /(?:火车|高铁|动车)?站$|机场|航站楼|地铁站$|地铁口|停车场|出入口|检票口|游客中心$/

const GLOBAL_LANDMARKS: Record<string, GeoPoint> = {
  八达岭长城: { lng: 116.0167, lat: 40.3592 },
  八达岭: { lng: 116.0167, lat: 40.3592 },
  慕田峪长城: { lng: 116.5704, lat: 40.4317 },
  居庸关长城: { lng: 116.0726, lat: 40.2919 },
  故宫博物院: { lng: 116.397, lat: 39.918 },
  秦始皇兵马俑博物馆: { lng: 109.273, lat: 34.384 },
  兵马俑: { lng: 109.273, lat: 34.384 },
}

const CITY_LANDMARKS: Record<string, Record<string, GeoPoint>> = {
  北京: {
    天安门广场: { lng: 116.3975, lat: 39.9032 },
    前门大街: { lng: 116.3972, lat: 39.8953 },
    颐和园: { lng: 116.275, lat: 39.999 },
    圆明园: { lng: 116.301, lat: 40.008 },
    清华大学: { lng: 116.326, lat: 40.003 },
    什刹海: { lng: 116.386, lat: 39.941 },
    南锣鼓巷: { lng: 116.403, lat: 39.936 },
    簋街: { lng: 116.416, lat: 39.941 },
    牛街: { lng: 116.363, lat: 39.886 },
    景山公园: { lng: 116.397, lat: 39.925 },
    北京站: { lng: 116.427, lat: 39.903 },
    北京北站: { lng: 116.352, lat: 39.944 },
    北京西站: { lng: 116.322, lat: 39.894 },
    北京南站: { lng: 116.378, lat: 39.865 },
  },
  青岛: {
    青岛啤酒博物馆: { lng: 120.347, lat: 36.088 },
    台东步行街: { lng: 120.355, lat: 36.087 },
    栈桥: { lng: 120.319, lat: 36.064 },
    奥帆中心: { lng: 120.395, lat: 36.06 },
    八大关风景区: { lng: 120.343, lat: 36.053 },
    劈柴院: { lng: 120.326, lat: 36.067 },
  },
  成都: {
    宽窄巷子: { lng: 104.055, lat: 30.669 },
    锦里: { lng: 104.049, lat: 30.645 },
    春熙路: { lng: 104.081, lat: 30.657 },
    武侯祠: { lng: 104.048, lat: 30.647 },
  },
  西安: {
    钟楼: { lng: 108.945, lat: 34.259 },
    回民街: { lng: 108.944, lat: 34.262 },
    大雁塔: { lng: 108.964, lat: 34.218 },
    陕西历史博物馆: { lng: 108.955, lat: 34.224 },
  },
  杭州: {
    西湖: { lng: 120.148, lat: 30.242 },
    灵隐寺: { lng: 120.101, lat: 30.242 },
    河坊街: { lng: 120.169, lat: 30.241 },
  },
  上海: {
    新天地: { lng: 121.475, lat: 31.22 },
    豫园: { lng: 121.492, lat: 31.227 },
    城隍庙: { lng: 121.493, lat: 31.224 },
    外滩: { lng: 121.49, lat: 31.24 },
    南京路步行街: { lng: 121.475, lat: 31.234 },
    武康路: { lng: 121.437, lat: 31.209 },
    田子坊: { lng: 121.468, lat: 31.21 },
    东方明珠: { lng: 121.495, lat: 31.24 },
    陆家嘴: { lng: 121.503, lat: 31.239 },
    静安寺: { lng: 121.447, lat: 31.224 },
    迪士尼: { lng: 121.667, lat: 31.144 },
  },
  南昌: {
    八一广场: { lng: 115.905, lat: 28.674 },
    万寿宫: { lng: 115.889, lat: 28.676 },
    大士院: { lng: 115.892, lat: 28.678 },
    珠宝街: { lng: 115.89, lat: 28.675 },
    滕王阁: { lng: 115.879, lat: 28.675 },
    南昌之星: { lng: 115.876, lat: 28.653 },
    艾溪湖: { lng: 115.965, lat: 28.697 },
    秋水广场: { lng: 115.877, lat: 28.689 },
  },
  承德: {
    避暑山庄: { lng: 117.937, lat: 40.989 },
    普宁寺: { lng: 117.934, lat: 41.011 },
    二仙居: { lng: 117.939, lat: 40.976 },
    普陀宗乘之庙: { lng: 117.946, lat: 41.018 },
    磬锤峰: { lng: 117.915, lat: 40.968 },
  },
  秦皇岛: {
    山海关: { lng: 119.765, lat: 40.01 },
    老龙头: { lng: 119.844, lat: 39.966 },
    鸽子窝公园: { lng: 119.46, lat: 39.842 },
    鸽子窝: { lng: 119.46, lat: 39.842 },
    老虎石: { lng: 119.455, lat: 39.825 },
    北戴河: { lng: 119.484, lat: 39.834 },
    秦皇岛站: { lng: 119.601, lat: 39.965 },
    北戴河站: { lng: 119.424, lat: 39.866 },
    刘庄: { lng: 119.476, lat: 39.828 },
    阿那亚: { lng: 119.316, lat: 39.667 },
    秦皇求仙入海处: { lng: 119.524, lat: 39.924 },
    求仙入海: { lng: 119.524, lat: 39.924 },
    石塘路市场: { lng: 119.598, lat: 39.928 },
    石塘路海鲜市场: { lng: 119.598, lat: 39.928 },
  },
  石家庄: {
    赵州桥: { lng: 114.776, lat: 37.718 },
    正定古城: { lng: 114.569, lat: 38.144 },
  },
  敦煌: {
    莫高窟: { lng: 94.809, lat: 40.042 },
    鸣沙山月牙泉: { lng: 94.668, lat: 40.089 },
    鸣沙山: { lng: 94.668, lat: 40.089 },
    阳关景区: { lng: 94.058, lat: 39.931 },
    玉门关: { lng: 93.865, lat: 40.353 },
  },
  丽江: {
    大研古城: { lng: 100.234, lat: 26.872 },
    玉龙雪山: { lng: 100.258, lat: 27.098 },
  },
  平潭: {
    坛南湾: { lng: 119.898, lat: 25.438 },
    龙王头沙滩: { lng: 119.789, lat: 25.501 },
    龙凤头海滨浴场: { lng: 119.789, lat: 25.501 },
    海坛古城: { lng: 119.778, lat: 25.472 },
    北港村: { lng: 119.945, lat: 25.592 },
    长江澳风力田: { lng: 119.967, lat: 25.612 },
    猴研岛: { lng: 119.872, lat: 25.458 },
    石牌洋景区: { lng: 119.845, lat: 25.512 },
    象鼻湾: { lng: 119.756, lat: 25.468 },
    镜沙: { lng: 119.934, lat: 25.578 },
    澳前镇: { lng: 119.812, lat: 25.448 },
    '68海里景区': { lng: 119.868, lat: 25.452 },
    流水镇: { lng: 119.728, lat: 25.498 },
  },
  福州: { 三坊七巷: { lng: 119.301, lat: 26.082 }, 鼓山: { lng: 119.389, lat: 26.038 }, 西湖公园: { lng: 119.286, lat: 26.099 } },
  武夷山: { 天游峰: { lng: 117.991, lat: 27.635 }, 武夷宫: { lng: 117.978, lat: 27.652 }, 九曲溪: { lng: 117.968, lat: 27.641 } },
  黄山: { 迎客松: { lng: 118.169, lat: 30.139 }, 光明顶: { lng: 118.164, lat: 30.132 }, 宏村: { lng: 117.998, lat: 30.004 } },
  泰山: { 岱庙: { lng: 117.135, lat: 36.192 }, 红门: { lng: 117.125, lat: 36.215 }, 玉皇顶: { lng: 117.112, lat: 36.254 } },
  峨眉山: { 报国寺: { lng: 103.485, lat: 29.552 }, 金顶: { lng: 103.337, lat: 29.523 } },
  乐山: { 乐山大佛: { lng: 103.772, lat: 29.544 }, 乌尤寺: { lng: 103.768, lat: 29.541 } },
  九寨沟: { 九寨沟风景区: { lng: 103.918, lat: 33.262 }, 五花海: { lng: 103.885, lat: 33.162 }, 诺日朗瀑布: { lng: 103.912, lat: 33.178 } },
  贵阳: { 甲秀楼: { lng: 106.714, lat: 26.574 }, 青岩古镇: { lng: 106.676, lat: 26.338 } },
  拉萨: { 布达拉宫: { lng: 91.118, lat: 29.655 }, 大昭寺: { lng: 91.132, lat: 29.652 }, 八廓街: { lng: 91.131, lat: 29.651 } },
  洛阳: { 龙门石窟: { lng: 112.477, lat: 34.558 }, 白马寺: { lng: 112.605, lat: 34.722 } },
  扬州: { 瘦西湖: { lng: 119.421, lat: 32.408 }, 个园: { lng: 119.446, lat: 32.402 } },
  无锡: { 鼋头渚: { lng: 120.228, lat: 31.515 }, 灵山大佛: { lng: 120.098, lat: 31.431 } },
  宁波: { 天一阁博物院: { lng: 121.539, lat: 29.871 }, 老外滩: { lng: 121.559, lat: 29.878 } },
  绍兴: { 鲁迅故里: { lng: 120.582, lat: 29.992 }, 沈园: { lng: 120.579, lat: 29.988 } },
  乌镇: { 乌镇西栅景区: { lng: 120.485, lat: 30.748 }, 乌镇东栅景区: { lng: 120.498, lat: 30.741 } },
  舟山: { 普陀山: { lng: 122.385, lat: 29.977 }, 普济寺: { lng: 122.387, lat: 29.978 } },
  威海: { 刘公岛: { lng: 122.183, lat: 37.501 }, 成山头风景区: { lng: 122.691, lat: 37.389 } },
  济南: { 趵突泉: { lng: 117.015, lat: 36.661 }, 大明湖: { lng: 117.027, lat: 36.672 } },
  长白山: { 长白山北坡: { lng: 128.062, lat: 42.042 }, 天池: { lng: 128.056, lat: 42.005 } },
  青海湖: { 青海湖二郎剑景区: { lng: 100.548, lat: 36.601 }, 茶卡盐湖: { lng: 99.078, lat: 36.791 }, 塔尔寺: { lng: 101.568, lat: 36.487 } },
  张掖: { 张掖七彩丹霞旅游景区: { lng: 100.113, lat: 38.959 }, 大佛寺: { lng: 100.458, lat: 38.931 } },
  华山: { 华山游客中心: { lng: 110.092, lat: 34.561 }, 西峰: { lng: 110.082, lat: 34.482 } },
  武当山: { 金顶: { lng: 111.004, lat: 32.401 }, 太子坡: { lng: 111.015, lat: 32.418 } },
  恩施: { 恩施大峡谷: { lng: 109.198, lat: 30.456 }, 恩施土司城: { lng: 109.479, lat: 30.283 } },
  宜昌: { 三峡大坝: { lng: 111.003, lat: 30.823 }, 三峡人家: { lng: 111.156, lat: 30.791 } },
  婺源: { 篁岭: { lng: 117.978, lat: 29.328 }, 江湾景区: { lng: 118.004, lat: 29.369 } },
  景德镇: { 古窑民俗博览区: { lng: 117.184, lat: 29.291 }, 陶溪川文创街区: { lng: 117.218, lat: 29.301 } },
  庐山: { 牯岭镇: { lng: 115.992, lat: 29.574 }, 含鄱口: { lng: 116.018, lat: 29.548 }, 三叠泉: { lng: 116.008, lat: 29.519 } },
  西双版纳: { 野象谷: { lng: 101.019, lat: 22.143 }, 告庄西双景: { lng: 100.803, lat: 22.010 } },
  腾冲: { 热海景区: { lng: 98.441, lat: 24.948 }, 和顺古镇: { lng: 98.485, lat: 25.018 } },
  香格里拉: { 独克宗古城: { lng: 99.708, lat: 27.825 }, 普达措国家公园: { lng: 99.951, lat: 27.839 }, 松赞林寺: { lng: 99.703, lat: 27.868 } },
  北海: { 北海银滩: { lng: 109.292, lat: 21.449 }, 涠洲岛: { lng: 109.105, lat: 21.042 } },
  潮州: { 牌坊街: { lng: 116.652, lat: 23.661 }, 广济桥: { lng: 116.661, lat: 23.661 } },
  珠海: { 珠海渔女: { lng: 113.588, lat: 22.261 }, 珠海长隆海洋王国: { lng: 113.538, lat: 22.099 } },
  泉州: { 开元寺: { lng: 118.585, lat: 24.917 }, 西街: { lng: 118.584, lat: 24.916 }, 清源山: { lng: 118.614, lat: 24.949 } },
  三亚: {
    亚龙湾: { lng: 109.645, lat: 18.233 },
    亚龙湾海滩: { lng: 109.645, lat: 18.233 },
    亚龙湾热带天堂森林公园: { lng: 109.64, lat: 18.256 },
    天涯海角: { lng: 109.35, lat: 18.3 },
    蜈支洲岛: { lng: 109.766, lat: 18.312 },
    后海村: { lng: 109.73, lat: 18.272 },
    滕海渔村: { lng: 109.73, lat: 18.272 },
    藤海社区: { lng: 109.73, lat: 18.272 },
    南山文化旅游区: { lng: 109.208, lat: 18.298 },
    南山寺: { lng: 109.208, lat: 18.298 },
    鹿回头: { lng: 109.501, lat: 18.225 },
    鹿回头公园: { lng: 109.501, lat: 18.225 },
    第一市场: { lng: 109.508, lat: 18.247 },
    大东海: { lng: 109.525, lat: 18.222 },
    西岛: { lng: 109.366, lat: 18.225 },
  },
}

export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

export function normalizeCityName(city: string): string {
  return city.replace(/(市|县|区|自治州|地区|盟)$/, '').trim()
}

export function primaryPlaceName(name: string): string {
  return name
    .split(/[/|、·]/)[0]
    .replace(/[（(].*?[）)]/g, '')
    .trim()
}

function landmarkMatches(primary: string, key: string): boolean {
  if (primary === key || primary.includes(key)) {
    return true
  }
  return primary.length >= 3 && key.includes(primary)
}

function lookupInTable(
  table: Record<string, GeoPoint>,
  primary: string,
): GeoPoint | null {
  const entries = Object.entries(table).sort(([a], [b]) => b.length - a.length)
  for (const [key, point] of entries) {
    if (landmarkMatches(primary, key)) {
      return point
    }
  }
  return null
}

export function lookupKnownLandmark(name: string, city?: string): GeoPoint | null {
  const citiesToTry = new Set<string>()
  if (city) {
    citiesToTry.add(extractDestinationRegion(city))
    citiesToTry.add(inferStopCity(name, city))
  }

  for (const alias of landmarkSearchAliases(name, city)) {
    for (const tryCity of citiesToTry) {
      if (tryCity && CITY_LANDMARKS[tryCity]) {
        const cityMatch = lookupInTable(CITY_LANDMARKS[tryCity], alias)
        if (cityMatch) {
          return cityMatch
        }
      }
    }

    const globalMatch = lookupInTable(GLOBAL_LANDMARKS, alias)
    if (globalMatch) {
      return globalMatch
    }
  }

  return null
}

/** 从长名称拆出可匹配地标的别名（如「大士院小吃街」→「大士院」） */
export function landmarkSearchAliases(name: string, city?: string): string[] {
  const cityName = city ? normalizeCityName(city) : ''
  const primary = primaryPlaceName(name)
  const stripped = primary.replace(new RegExp(`^${cityName}`), '').trim()
  const aliases = [primary, stripped, name]

  if (/小吃/.test(stripped)) {
    const base = stripped.replace(/小吃.*$/, '').replace(/街$/, '').trim()
    if (base) aliases.push(base)
  }
  if (/历史文化街区|历史街区|文化街区/.test(stripped)) {
    aliases.push(stripped.replace(/历史文化街区|历史街区|文化街区/, '').trim())
  }
  if (/湿地/.test(stripped)) {
    aliases.push(stripped.replace(/公园.*$/, '').trim())
  }
  if (/后海/.test(stripped) && cityName === '三亚') {
    aliases.push('海棠湾后海村', '三亚后海村', '滕海渔村', '藤海社区')
  }
  if (/坛南湾|长江澳|北港|蓝眼泪|追泪/.test(stripped) && cityName === '平潭') {
    aliases.push('平潭坛南湾', '平潭长江澳', '平潭北港村')
  }

  return [...new Set(aliases.filter((item) => item.length >= 2))]
}

export function isRemoteExcursion(name: string): boolean {
  return REMOTE_EXCURSION_RE.test(primaryPlaceName(name))
}

/** 需乘船/渡轮到达的海岛类景点（路线用直线，不走驾车规划） */
const ISLAND_STOP_RE =
  /蜈支洲|西岛|分界洲|涠洲|崇明|长岛|鼓浪屿|普陀|东极|南麂|海陵|刘公|大陈|东山岛|南澳|金门|平潭|嵊泗|朱家尖|东澳|外伶仃|桂山岛|桃花岛|养马岛|大嵛山|小嵛山|南长山|北长山/

export function isIslandExcursion(name: string): boolean {
  const primary = primaryPlaceName(name)
  if (/半岛/.test(primary)) {
    return false
  }
  if (ISLAND_STOP_RE.test(primary)) {
    return true
  }
  if (/岛/.test(primary) && !/(群岛|酒店|饭店|餐厅|城市)/.test(primary)) {
    return true
  }
  return false
}

/** 高德常误匹配的离岸 POI（海上观音、客运码头等） */
export function isOffshorePoi(poiName: string): boolean {
  const normalized = poiName.replace(/\s/g, '')
  if (/上海/.test(normalized)) {
    return false
  }
  return /海上观音|观音岛|登船|客运码头|游艇码头|游船码头|渡口|渡轮|乘船点|码头$|客运$|登岛|出海口/.test(
    normalized,
  )
}

export function shouldPreferLandmarkOverGeocode(
  stopName: string,
  geocoded: GeoPoint,
  landmark: GeoPoint,
): boolean {
  if (isIslandExcursion(stopName)) {
    return false
  }
  if (distanceKm(geocoded, landmark) > 3) {
    return true
  }
  // 后海村易误匹配到蜈支洲岛附近海域
  if (/后海/.test(primaryPlaceName(stopName))) {
    const islandAnchor = lookupKnownLandmark('蜈支洲岛', '三亚')
    if (
      islandAnchor &&
      distanceKm(geocoded, islandAnchor) < 5 &&
      distanceKm(landmark, islandAnchor) >= 5
    ) {
      return true
    }
  }
  return false
}

export function isShuttlePoi(poiName: string): boolean {
  return POI_SHUTTLE_RE.test(poiName.replace(/\s/g, ''))
}

export function isNonAttractionStop(name: string): boolean {
  const primary = primaryPlaceName(name).replace(/\s/g, '')
  if (!NON_ATTRACTION_RE.test(primary)) {
    return false
  }
  return !/(古城|广场|公园|景区|博物馆|寺|街|巷|楼|塔|山|海|湖|岛|市场|步行街)/.test(
    primary,
  )
}

export function isNonAttractionPoi(poiName: string): boolean {
  return isNonAttractionStop(poiName)
}

export function shouldBindToCluster(stopName: string): boolean {
  return !isRemoteExcursion(stopName)
}

export function shouldAddToUrbanCluster(stopName: string): boolean {
  return shouldBindToCluster(stopName)
}

export function isWithinDestination(
  point: GeoPoint,
  cityCenter: GeoPoint | null,
  stopName: string,
  destination?: string,
): boolean {
  const center = destination
    ? resolveStopGeoContext(stopName, destination, cityCenter).center
    : cityCenter
  if (!center) {
    return true
  }
  const maxKm = isRemoteExcursion(stopName)
    ? MAX_REMOTE_FROM_CENTER_KM
    : MAX_URBAN_FROM_CENTER_KM
  return distanceKm(center, point) <= maxKm
}

export function isRemoteStopPoint(
  stopName: string,
  point: GeoPoint,
  cityCenter: GeoPoint | null,
  destination?: string,
): boolean {
  if (isRemoteExcursion(stopName)) {
    return true
  }
  const center = destination
    ? resolveStopGeoContext(stopName, destination, cityCenter).center
    : cityCenter
  if (!center) {
    return false
  }
  return distanceKm(center, point) > 35
}

export function isCoordPlausibleForStop(
  point: GeoPoint,
  anchor: GeoPoint | null,
  stopName: string,
): boolean {
  if (!anchor) {
    return true
  }
  const maxKm = isRemoteExcursion(stopName)
    ? MAX_REMOTE_LANDMARK_KM
    : MAX_CITY_STOP_KM
  return distanceKm(anchor, point) <= maxKm
}

const RAILWAY_STATIONS = [
  '北京北站',
  '北京站',
  '北京西站',
  '北京南站',
  '北京东站',
  '上海虹桥站',
  '上海站',
]

function scoreRailwayStationMatch(poiName: string, keyword: string): number {
  const normalizedPoi = poiName.replace(/\s/g, '')
  const primary = primaryPlaceName(keyword).replace(/\s/g, '')

  for (const station of RAILWAY_STATIONS) {
    if (!primary.includes(station)) {
      continue
    }
    if (normalizedPoi.includes(station)) {
      return 30
    }
    if (/站/.test(normalizedPoi)) {
      return -60
    }
  }

  return 0
}

function poiKeywordTokens(keyword: string): string[] {
  const primary = primaryPlaceName(keyword).replace(/[（(].*?[）)]/g, '').trim()
  const tokens = new Set<string>([
    keyword.replace(/\s/g, ''),
    primary,
    ...keyword.split(/[/|、·]/).map((part) => part.trim()),
  ])

  for (const base of [primary, keyword.replace(/\s/g, '')]) {
    tokens.add(base.replace(/^[\u4e00-\u9fa5]{2,8}市?/, '').trim())
    tokens.add(base.replace(/^[\u4e00-\u9fa5]{2,8}市?[\u4e00-\u9fa5]{0,6}区/, '').trim())
  }

  if (/海鲜市场/.test(primary)) {
    tokens.add('海鲜市场')
  }
  if (/求仙|入海/.test(primary)) {
    tokens.add('秦皇求仙入海处')
    tokens.add('求仙入海')
  }
  if (/小吃/.test(primary)) {
    const base = primary.replace(/小吃.*$/, '').replace(/街$/, '').trim()
    if (base) {
      tokens.add(base)
    }
  }

  return [...tokens].filter((token) => token.length >= 2)
}

export function poiNameScore(poiName: string, keyword: string): number {
  const normalizedPoi = poiName.replace(/\s/g, '')
  const tokens = poiKeywordTokens(keyword)

  let score = scoreRailwayStationMatch(poiName, keyword)
  for (const token of tokens) {
    if (normalizedPoi.includes(token)) {
      score += token.length
    } else if (token.length >= 4 && token.includes(normalizedPoi)) {
      score += normalizedPoi.length
    }
  }

  if (isShuttlePoi(poiName) || isNonAttractionPoi(poiName)) {
    score -= 30
  }

  if (isOffshorePoi(poiName) && !isIslandExcursion(keyword)) {
    score -= 50
  }

  if (/后海/.test(keyword)) {
    if (/海棠|藤海|滕海|林旺|三亚/.test(normalizedPoi)) {
      score += 15
    }
    if (/北京|什刹|西城|东城/.test(normalizedPoi)) {
      score -= 40
    }
    if (/蜈支洲|码头/.test(normalizedPoi) && !/后海|藤海|滕海/.test(normalizedPoi)) {
      score -= 35
    }
  }

  if (isRemoteExcursion(keyword)) {
    if (/景区|风景名胜|世界遗产|国家公园/.test(normalizedPoi)) {
      score += 10
    }
    if (isShuttlePoi(poiName)) {
      score -= 20
    }
  }

  return score
}

export function isCoordTooCloseToAny(
  point: GeoPoint,
  anchors: GeoPoint[],
  minKm = MIN_STOP_SEPARATION_KM,
): boolean {
  return anchors.some((anchor) => distanceKm(anchor, point) < minKm)
}

export function isCoordPlausible(point: GeoPoint, anchor: GeoPoint | null): boolean {
  if (!anchor) {
    return true
  }
  return distanceKm(anchor, point) <= MAX_CITY_STOP_KM
}

export function isCoordNearCluster(
  point: GeoPoint,
  anchors: GeoPoint[],
): boolean {
  if (!anchors.length) {
    return true
  }
  return anchors.some((anchor) => distanceKm(anchor, point) <= MAX_CLUSTER_JUMP_KM)
}

export function pickClosestPoint(
  points: GeoPoint[],
  anchor: GeoPoint,
): GeoPoint | null {
  if (!points.length) {
    return null
  }
  return [...points].sort(
    (a, b) => distanceKm(anchor, a) - distanceKm(anchor, b),
  )[0]
}

export function fallbackCoordsNear(
  anchor: GeoPoint,
  stopIndex: number,
): GeoPoint {
  const angle = stopIndex * 1.047
  const radius = 0.004 + (stopIndex % 3) * 0.002
  return {
    lng: anchor.lng + Math.cos(angle) * radius,
    lat: anchor.lat + Math.sin(angle) * radius * 0.6,
  }
}

export function buildPlaceQueries(name: string, city: string): string[] {
  const cityName = normalizeCityName(city) || city
  const primary = primaryPlaceName(name)
  const stripped = primary.replace(new RegExp(`^${cityName}`), '').trim()
  const withCity = primary.includes(cityName) ? primary : `${cityName}市${primary}`

  const queries = [
    primary,
    name,
    withCity,
    stripped !== primary ? `${cityName}市${stripped}` : '',
    stripped !== primary ? `${cityName}${stripped}` : '',
    stripped.includes('啤酒') ? `${cityName}市啤酒博物馆` : '',
    stripped.includes('奥帆') ? `${cityName}奥帆中心` : '',
    stripped.includes('路') && cityName !== '上海'
      ? `${cityName}市市南区${stripped}`
      : '',
    stripped.includes('路') ? `${cityName}市${stripped}` : '',
    stripped,
  ]

  if (/城隍庙|城隍/.test(stripped)) {
    queries.push(`${cityName}城隍庙`, `${cityName}市城隍庙`)
  }
  if (/豫园/.test(stripped)) {
    queries.push(`${cityName}豫园`, `${cityName}市豫园`, '豫园')
  }
  if (/新天地/.test(stripped)) {
    queries.push(`${cityName}新天地`, `${cityName}市新天地`)
  }
  if (/小吃/.test(stripped)) {
    const base = stripped.replace(/小吃.*$/, '').replace(/街$/, '').trim()
    if (base) {
      queries.push(`${cityName}${base}`, `${cityName}市${base}`, base)
    }
  }
  if (/湿地/.test(stripped)) {
    queries.push(`${cityName}${stripped}`, stripped.replace(/公园.*$/, ''))
  }
  if (/摩天轮|珠宝街|万寿宫|大士院/.test(stripped)) {
    queries.push(`${cityName}${stripped}`, stripped)
  }
  if (/求仙|入海/.test(stripped)) {
    queries.push('秦皇求仙入海处', `${cityName}秦皇求仙入海处`, `${cityName}求仙入海`)
  }
  if (/海鲜市场/.test(stripped)) {
    queries.push(`${cityName}海鲜市场`, '海鲜市场', stripped)
  }
  if (/后海/.test(stripped) && cityName === '三亚') {
    queries.push(
      `${cityName}海棠湾后海村`,
      '海棠湾镇后海村',
      '林旺镇后海村',
      '滕海渔村',
      `${cityName}后海村`,
      '后海渔村',
    )
  }

  if (/长城|八达岭|慕田峪|居庸关|兵马俑|雅丹|玉龙雪山|阳朔/.test(stripped)) {
    queries.push(`${stripped}景区`, `${stripped}风景名胜区`)
  }

  return [...new Set(queries.filter(Boolean))]
}

/** 无坐标时的地图默认中心（不依赖网络） */
const CITY_DEFAULT_CENTER: Record<string, GeoPoint> = {
  北京: { lng: 116.397, lat: 39.903 },
  上海: { lng: 121.473, lat: 31.23 },
  成都: { lng: 104.066, lat: 30.572 },
  青岛: { lng: 120.382, lat: 36.067 },
  烟台: { lng: 121.448, lat: 37.463 },
  西安: { lng: 108.939, lat: 34.341 },
  杭州: { lng: 120.155, lat: 30.274 },
  敦煌: { lng: 94.662, lat: 40.142 },
  河北: { lng: 114.514, lat: 38.042 },
  石家庄: { lng: 114.514, lat: 38.042 },
  承德: { lng: 117.939, lat: 40.976 },
  秦皇岛: { lng: 119.6, lat: 39.935 },
  南昌: { lng: 115.857, lat: 28.682 },
  三亚: { lng: 109.512, lat: 18.252 },
  平潭: { lng: 119.79, lat: 25.50 },
  福州: { lng: 119.296, lat: 26.074 },
  武夷山: { lng: 118.035, lat: 27.756 },
  黄山: { lng: 118.337, lat: 29.714 },
  泰山: { lng: 117.129, lat: 36.251 },
  峨眉山: { lng: 103.484, lat: 29.601 },
  乐山: { lng: 103.765, lat: 29.552 },
  九寨沟: { lng: 103.919, lat: 33.152 },
  贵阳: { lng: 106.713, lat: 26.578 },
  拉萨: { lng: 91.132, lat: 29.660 },
  洛阳: { lng: 112.454, lat: 34.619 },
  扬州: { lng: 119.421, lat: 32.393 },
  无锡: { lng: 120.311, lat: 31.491 },
  宁波: { lng: 121.550, lat: 29.874 },
  绍兴: { lng: 120.582, lat: 30.002 },
  乌镇: { lng: 120.491, lat: 30.744 },
  舟山: { lng: 122.207, lat: 29.985 },
  威海: { lng: 122.121, lat: 37.513 },
  济南: { lng: 117.000, lat: 36.675 },
  长白山: { lng: 128.048, lat: 42.051 },
  青海湖: { lng: 100.137, lat: 36.623 },
  张掖: { lng: 100.455, lat: 38.932 },
  华山: { lng: 110.092, lat: 34.561 },
  武当山: { lng: 111.004, lat: 32.401 },
  恩施: { lng: 109.479, lat: 30.283 },
  宜昌: { lng: 111.290, lat: 30.692 },
  婺源: { lng: 117.861, lat: 29.248 },
  景德镇: { lng: 117.214, lat: 29.292 },
  庐山: { lng: 115.992, lat: 29.574 },
  西双版纳: { lng: 100.803, lat: 22.010 },
  腾冲: { lng: 98.497, lat: 25.017 },
  香格里拉: { lng: 99.708, lat: 27.825 },
  北海: { lng: 109.119, lat: 21.473 },
  潮州: { lng: 116.622, lat: 23.656 },
  珠海: { lng: 113.576, lat: 22.270 },
  泉州: { lng: 118.589, lat: 24.908 },
}

export function defaultCityCenter(city: string): GeoPoint {
  const region = extractDestinationRegion(city)
  return CITY_DEFAULT_CENTER[region] ?? CITY_DEFAULT_CENTER[normalizeCityName(city)] ?? {
    lng: 116.397,
    lat: 39.903,
  }
}
