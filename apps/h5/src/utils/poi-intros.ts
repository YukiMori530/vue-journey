/** 常见 POI 差异化简介，避免所有景点显示同一套模板文案 */
const POI_INTRO_RULES: Array<{
  pattern: RegExp
  intro: (name: string, destination: string, minutes: number) => string
}> = [
  {
    pattern: /四方街/,
    intro: (name, destination, minutes) =>
      `${name}是${destination}古城的中心广场，白天适合看纳西建筑，傍晚常有时令市集与街头表演。建议预留约 ${minutes} 分钟，可从这里向木府、狮子山方向步行串联游览。`,
  },
  {
    pattern: /万古楼|狮子山/,
    intro: (name, destination, minutes) =>
      `${name}位于${destination}古城制高点，可俯瞰全城瓦屋与玉龙雪山远景。建议预留约 ${minutes} 分钟，登楼前留意开放时间与风大时的体感温度。`,
  },
  {
    pattern: /木府/,
    intro: (name, destination, minutes) =>
      `${name}曾是${destination}土司府邸，建筑融合汉、白、纳西风格。建议预留约 ${minutes} 分钟，可结合讲解了解当地历史，并与四方街、狮子山安排在同一天步行游览。`,
  },
  {
    pattern: /古城|古镇|历史街区|老街/,
    intro: (name, destination, minutes) =>
      `${name}保留了${destination}传统街巷与生活气息，适合慢走拍照、找小吃与手作店。建议预留约 ${minutes} 分钟，高峰时段小巷较窄，可按开放区域错峰进入。`,
  },
  {
    pattern: /雪山|索道|冰川|蓝月谷/,
    intro: (name, destination, minutes) =>
      `${name}是${destination}周边的高海拔自然景点，需关注天气、索道运营与防寒装备。建议预留约 ${minutes} 分钟，并提前确认门票与上山交通时间。`,
  },
  {
    pattern: /寺|庙|宫|塔|楼|阁/,
    intro: (name, destination, minutes) =>
      `${name}是${destination}重要的人文地标，适合了解当地宗教与建筑文化。建议预留约 ${minutes} 分钟，参观时尊重场所礼仪与拍照规定。`,
  },
  {
    pattern: /博物馆|纪念馆|展览/,
    intro: (name, destination, minutes) =>
      `${name}适合作为${destination}行程中的室内补给点，可系统了解城市历史。建议预留约 ${minutes} 分钟，周一闭馆情况较常见，出发前可确认开放时间。`,
  },
  {
    pattern: /市场|夜市|小吃|美食|餐厅|食堂/,
    intro: (name, destination, minutes) =>
      `${name}适合体验${destination}本地饮食，高峰时段可能排队。建议预留 ${minutes} 分钟左右，可先确认招牌菜与营业时间，再衔接前后景点。`,
  },
  {
    pattern: /公园|湖|湾|滩|海|江|河|瀑布|峡谷/,
    intro: (name, destination, minutes) =>
      `${name}以自然与城市景观见长，适合作为${destination}行程中的放松节点。建议预留约 ${minutes} 分钟，按季节准备防晒或保暖，并留意步道开放情况。`,
  },
]

export function buildPoiIntro(
  name: string,
  destination: string,
  minutes: number,
  category: string,
): string | null {
  const dest = destination.replace(/(市|县|区|省)$/, '')
  for (const rule of POI_INTRO_RULES) {
    if (rule.pattern.test(name)) {
      return rule.intro(name, dest, minutes)
    }
  }

  if (category === 'food') {
    return `${name}在${dest}本地口碑不错，适合作为用餐或小吃打卡点。建议预留 ${minutes} 分钟左右，高峰时段可能排队。`
  }

  return null
}
