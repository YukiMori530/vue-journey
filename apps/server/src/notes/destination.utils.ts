const DESTINATION_ALIASES: Record<string, string[]> = {
  平潭: ['平潭', '平潭岛', '福州平潭', '福建平潭'],
  福州: ['福州', '榕城', '三坊七巷'],
  厦门: ['厦门', '鼓浪屿', '思明'],
  三亚: ['三亚', '海棠湾', '亚龙湾'],
  武夷山: ['武夷山', '武夷', '九曲溪'],
  黄山: ['黄山', '宏村', '西递'],
  泰山: ['泰山', '泰安', '岱庙'],
  峨眉山: ['峨眉山', '峨眉', '乐山峨眉'],
  乐山: ['乐山', '乐山大佛'],
  九寨沟: ['九寨沟', '阿坝九寨沟'],
  拉萨: ['拉萨', '布达拉宫'],
  青海湖: ['青海湖', '西宁', '茶卡盐湖'],
  香格里拉: ['香格里拉', '迪庆', '中甸'],
  西双版纳: ['西双版纳', '版纳', '景洪'],
  乌镇: ['乌镇', '桐乡', '嘉兴乌镇'],
  普陀山: ['普陀山', '舟山', '朱家尖'],
  武当山: ['武当山', '十堰'],
  华山: ['华山', '渭南', '华阴'],
  庐山: ['庐山', '九江'],
  婺源: ['婺源', '篁岭'],
  北海: ['北海', '涠洲岛', '银滩'],
  泉州: ['泉州', '刺桐城'],
  恩施: ['恩施', '恩施大峡谷'],
};

const ISLAND_TO_REGION: Record<string, string> = {
  平潭岛: '平潭',
  嵛山岛: '福鼎',
  鼓浪屿: '厦门',
};

/** 中文/阿拉伯数字 + 天/日游，如「三日游」「3天」「两天行程」 */
const DAY_TRIP_RE =
  /(?:\d+|[一二三四五六七八九十百千万两]+)\s*[天日](?:游|行程|之旅)?/g;

/** 已知城市/目的地，长名称优先匹配 */
const KNOWN_CITIES = [
  '香格里拉',
  '西双版纳',
  '长白山',
  '青海湖',
  '千岛湖',
  '秦皇岛',
  '石家庄',
  '张家口',
  '景德镇',
  '张家界',
  '哈尔滨',
  '平潭岛',
  '武夷山',
  '峨眉山',
  '九寨沟',
  '普陀山',
  '武当山',
  '连云港',
  '平潭',
  '福州',
  '黄山',
  '泰山',
  '乐山',
  '贵阳',
  '拉萨',
  '承德',
  '洛阳',
  '扬州',
  '无锡',
  '宁波',
  '绍兴',
  '乌镇',
  '舟山',
  '威海',
  '济南',
  '张掖',
  '华山',
  '恩施',
  '宜昌',
  '婺源',
  '庐山',
  '腾冲',
  '北海',
  '潮州',
  '珠海',
  '泉州',
  '成都',
  '烟台',
  '北京',
  '上海',
  '海南',
  '杭州',
  '西安',
  '重庆',
  '厦门',
  '大理',
  '丽江',
  '青岛',
  '苏州',
  '南京',
  '广州',
  '深圳',
  '武汉',
  '长沙',
  '三亚',
  '三明',
  '南昌',
  '敦煌',
  '保定',
  '唐山',
  '桂林',
  '天津',
  '昆明',
  '新干',
  '吉安',
  '武隆',
];

function normalizeCityToken(name: string): string {
  const trimmed = name.trim();
  if (ISLAND_TO_REGION[trimmed]) {
    return ISLAND_TO_REGION[trimmed];
  }
  if (/平潭岛/.test(trimmed)) {
    return '平潭';
  }
  return trimmed.replace(/(市|县|区|省)$/, '').trim();
}

function extractKnownCity(text: string): string | null {
  for (const city of KNOWN_CITIES) {
    if (text.includes(city)) {
      return normalizeCityToken(city);
    }
  }
  return null;
}

/** 从用户输入/规划请求中归一化目的地，供攻略检索与 geocode 使用 */
export function normalizeSearchDestination(raw?: string): string {
  if (!raw?.trim()) {
    return '';
  }

  let text = raw.trim();

  text = text
    .replace(/^(?:帮我|请帮我|帮忙|我想|我要)?(?:规划|制定|安排|去|到)/, '')
    .replace(DAY_TRIP_RE, ' ')
    .replace(/(?:的)?(?:旅行|旅游|自由行)?(?:行程|路线|计划|攻略)/g, ' ')
    .replace(/[，,。！!？?\s]+/g, ' ')
    .trim();

  const islandMatch = text.match(/([\u4e00-\u9fa5]{2,8}岛)/);
  if (islandMatch) {
    const island = islandMatch[1];
    return ISLAND_TO_REGION[island] ?? island.replace(/岛$/, '') ?? island;
  }

  const knownCity = extractKnownCity(text);
  if (knownCity) {
    return knownCity;
  }

  const cleaned = text.replace(/(市|县|区|省)$/, '').trim();
  if (ISLAND_TO_REGION[cleaned]) {
    return ISLAND_TO_REGION[cleaned];
  }

  return cleaned.slice(0, 20);
}

export function destinationAliases(destination: string): string[] {
  const normalized = normalizeSearchDestination(destination);
  const aliases = new Set<string>([normalized, destination.trim()]);
  (DESTINATION_ALIASES[normalized] ?? []).forEach((item) => aliases.add(item));
  if (normalized !== destination.trim()) {
    aliases.add(destination.trim());
  }
  if (!normalized.endsWith('岛') && !normalized.endsWith('市')) {
    aliases.add(`${normalized}岛`);
    aliases.add(`${normalized}市`);
  }
  return [...aliases].filter(Boolean);
}

export function noteMatchesDestination(
  note: { destination: string; title: string; keywords: string[]; snippet?: string; content?: string },
  destination: string,
): boolean {
  const aliases = destinationAliases(destination);
  const haystack = [
    note.destination,
    note.title,
    note.snippet ?? '',
    note.content ?? '',
    ...note.keywords,
  ].join(' ');

  return aliases.some((alias) => {
    if (alias.length < 2) {
      return false;
    }
    if (haystack.includes(alias)) {
      return true;
    }
    // 「北京三日游」应匹配 destination=北京 的攻略
    return (
      note.destination.length >= 2 &&
      alias.includes(note.destination)
    );
  });
}
