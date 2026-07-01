/** 与 server notes.service citySlug 保持一致 */
export const DESTINATION_TO_SLUG: Record<string, string> = {
  北京: 'beijing',
  上海: 'shanghai',
  成都: 'chengdu',
  杭州: 'hangzhou',
  西安: 'xian',
  厦门: 'xiamen',
  青岛: 'qingdao',
  重庆: 'chongqing',
  广州: 'guangzhou',
  南京: 'nanjing',
  苏州: 'suzhou',
  武汉: 'wuhan',
  长沙: 'changsha',
  南昌: 'nanchang',
  昆明: 'kunming',
  三亚: 'sanya',
  海南: 'hainan',
  海口: 'haikou',
  丽江: 'lijiang',
  大理: 'dali',
  桂林: 'guilin',
  深圳: 'shenzhen',
  哈尔滨: 'harbin',
  张家界: 'zhangjiajie',
  敦煌: 'dunhuang',
  烟台: 'yantai',
  天津: 'tianjin',
  保定: 'baoding',
  福州: 'fuzhou',
  平潭: 'pingtan',
  太原: 'taiyuan',
  大同: 'datong',
  呼和浩特: 'hohhot',
  沈阳: 'shenyang',
  大连: 'dalian',
  长春: 'changchun',
  吉林: 'jilin',
  合肥: 'hefei',
  温州: 'wenzhou',
  台州: 'taizhou',
  徐州: 'xuzhou',
  开封: 'kaifeng',
  衡阳: 'hengyang',
  凤凰: 'fenghuang',
  南宁: 'nanning',
  柳州: 'liuzhou',
  汕头: 'shantou',
  佛山: 'foshan',
  湛江: 'zhanjiang',
  绵阳: 'mianyang',
  宜宾: 'yibin',
  遵义: 'zunyi',
  凯里: 'kaili',
  兰州: 'lanzhou',
  天水: 'tianshui',
  嘉峪关: 'jiayuguan',
  银川: 'yinchuan',
  中卫: 'zhongwei',
  乌鲁木齐: 'urumqi',
  喀什: 'kashgar',
  伊犁: 'yili',
  西宁: 'xining',
  林芝: 'linzhi',
  唐山: 'tangshan',
  张家口: 'zhangjiakou',
  湖州: 'huzhou',
  嘉兴: 'jiaxing',
  郑州: 'zhengzhou',
  武夷山: 'wuyishan',
  黄山: 'huangshan',
  泰山: 'taishan',
  峨眉山: 'emeishan',
  乐山: 'leshan',
  九寨沟: 'jiuzhaigou',
  贵阳: 'guiyang',
  拉萨: 'lhasa',
  承德: 'chengde',
  秦皇岛: 'qinhuangdao',
  洛阳: 'luoyang',
  扬州: 'yangzhou',
  无锡: 'wuxi',
  宁波: 'ningbo',
  绍兴: 'shaoxing',
  乌镇: 'wuzhen',
  舟山: 'zhoushan',
  威海: 'weihai',
  济南: 'jinan',
  长白山: 'changbaishan',
  青海湖: 'qinghaihu',
  张掖: 'zhangye',
  华山: 'huashan',
  武当山: 'wudangshan',
  恩施: 'enshi',
  宜昌: 'yichang',
  婺源: 'wuyuan',
  景德镇: 'jingdezhen',
  庐山: 'lushan',
  西双版纳: 'xishuangbanna',
  腾冲: 'tengchong',
  香格里拉: 'shangrila',
  北海: 'beihai',
  潮州: 'chaozhou',
  珠海: 'zhuhai',
  泉州: 'quanzhou',
}

const SLUG_TO_DEST = Object.fromEntries(
  Object.entries(DESTINATION_TO_SLUG).map(([dest, slug]) => [slug, dest]),
) as Record<string, string>

export function normalizeDestinationName(name: string): string {
  return name.replace(/(市|县|区|省)$/, '').trim()
}

export function citySlugFromDestination(destination: string): string {
  const key = normalizeDestinationName(destination)
  return DESTINATION_TO_SLUG[key] ?? key.toLowerCase().replace(/\s+/g, '-')
}

export function resolveDestinationFromCitySlug(slug: string): string {
  const normalized = slug.trim().toLowerCase()
  if (SLUG_TO_DEST[normalized]) {
    return SLUG_TO_DEST[normalized]
  }
  return normalized.replace(/-/g, '')
}

export function destinationDisplayName(destination: string): string {
  const base = normalizeDestinationName(destination)
  if (!base) {
    return destination
  }
  return destination.includes('市') ? destination : `${base}市`
}
