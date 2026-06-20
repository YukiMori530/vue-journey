export type PlanLogKind = 'intro' | 'search' | 'location' | 'result' | 'check' | 'adjust' | 'summary'

export interface PlanLogStep {
  kind: PlanLogKind
  text: string
  delayMs: number
}

const DESTINATION_HINTS: Record<string, { spots: string[]; foods: string[]; tips: string }> = {
  敦煌: {
    spots: ['莫高窟', '鸣沙山月牙泉', '阳关', '玉门关', '雅丹魔鬼城', '敦煌博物馆'],
    foods: ['驴肉黄面', '沙州夜市', '杏皮水'],
    tips: '莫高窟需提前预约，鸣沙山建议傍晚看日落',
  },
  成都: {
    spots: ['宽窄巷子', '武侯祠', '大熊猫基地', '锦里', '杜甫草堂', '春熙路'],
    foods: ['火锅', '串串', '兔头'],
    tips: '大熊猫基地建议早上开门就去',
  },
  新干: {
    spots: ['青铜文化公园', '新干县博物馆', '大洋洲商代青铜博物馆', '彩虹谷', '海木源景区'],
    foods: ['本地赣菜', '赣江鱼鲜'],
    tips: '可沿赣江串联青铜文化主题线路',
  },
  青岛: {
    spots: ['啤酒博物馆', '栈桥', '奥帆中心', '台东步行街', '劈柴院'],
    foods: ['海鲜市场', '啤酒', '台东夜市'],
    tips: '哈啤配海鲜，台东夜市和营口路海鲜市场本地人常去',
  },
}

function pickHints(destination: string) {
  const key = Object.keys(DESTINATION_HINTS).find((item) => destination.includes(item))
  if (key) {
    return DESTINATION_HINTS[key]
  }
  return {
    spots: [`${destination}必去景点`, `${destination}地标`, `${destination}博物馆`, `${destination}老街`],
    foods: [`${destination}本地美食`, `${destination}夜市`],
    tips: `${destination}建议 2-3 天慢游，旺季提前订票`,
  }
}

export function buildPlanGenerationSteps(
  destination: string,
  days: number,
  fullPrompt: string,
  preferences: string[] = [],
): PlanLogStep[] {
  const hints = pickHints(destination)
  const prefHint = preferences.length ? preferences.join('、') : '当地特色'
  const year = new Date().getFullYear()

  return [
    { kind: 'intro', text: `我来帮你规划${destination}${days}日游！重点围绕「${prefHint}」，先搜索攻略和最新信息。`, delayMs: 0 },
    { kind: 'search', text: `正在搜索小红书和全网信息：${destination}${prefHint}${days}日游 ${year}`, delayMs: 400 },
    { kind: 'search', text: `正在搜索小红书和全网信息：${destination}${hints.spots[0]}开放时间门票${year}`, delayMs: 450 },
    { kind: 'search', text: `正在搜索小红书和全网信息：${destination}旅游注意事项最佳路线`, delayMs: 400 },
    { kind: 'location', text: `正在搜索${destination}的地点：必去景点（${hints.spots.slice(0, 3).join('、')}等）`, delayMs: 500 },
    { kind: 'location', text: `正在搜索${destination}的地点：本地美食餐厅（${hints.foods.join('、')}）`, delayMs: 380 },
    { kind: 'location', text: `正在搜索${destination}的地点：夜市与特色街区`, delayMs: 350 },
    {
      kind: 'result',
      text: `搜索结果显示：建议${year}年${destination}${days}日游，第一天${hints.spots[0]}…第二天${hints.spots[1] ?? '深度游览'}…第三天可去${hints.spots[2] ?? '市区'}…`,
      delayMs: 550,
    },
    {
      kind: 'result',
      text: `搜索结果显示：${destination}建议 ${days} 天游玩。${hints.tips}…`,
      delayMs: 480,
    },
    {
      kind: 'check',
      text: `${destination}必去景点、${hints.spots.slice(0, 2).join('、')}…等 ${Math.min(days, 3)} 组地点需求的地点搜索结果已经整理好了。`,
      delayMs: 420,
    },
    { kind: 'intro', text: '信息已收集，现在计算路线顺序。', delayMs: 320 },
    { kind: 'intro', text: '正在计算路线顺序…', delayMs: 600 },
    { kind: 'check', text: '🚀 行程规划基本完成，正在第 1 次进行合理性验证…', delayMs: 450 },
    { kind: 'adjust', text: '检查完了，有一些小的优化空间，正在继续调整。', delayMs: 380 },
    {
      kind: 'adjust',
      text: `验证通过，正在优化：1) 第 1 天路线顺序；2) 第 2 天精简串联；3) 第 3 天补充${hints.spots[3] ?? '特色景点'}。`,
      delayMs: 420,
    },
    { kind: 'location', text: `正在查找地点信息：${hints.spots.slice(2, 4).join('、')}`, delayMs: 380 },
    { kind: 'check', text: `✅ 已帮你定位到 ${hints.spots.slice(2, 4).join('、')}。`, delayMs: 320 },
    { kind: 'intro', text: '好的，地点已补充…现在输出最终行程。', delayMs: 280 },
    { kind: 'summary', text: fullPrompt.replace(/^帮我规划/, '为你规划'), delayMs: 250 },
  ]
}

export const REVEAL_STATUS = '正在整理最终结果…'
export const GENERATING_STATUS = '正在生成行程中（AI 生成）'

export interface GeneratingMapStop {
  name: string
  lng: number
  lat: number
  order: number
  day: number
}
