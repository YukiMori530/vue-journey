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

/** 从用户输入/规划请求中归一化目的地，供攻略检索与 geocode 使用 */
export function normalizeSearchDestination(raw?: string): string {
  if (!raw?.trim()) {
    return '';
  }

  let text = raw.trim();

  text = text
    .replace(/^(?:帮我|请帮我|帮忙|我想|我要)?(?:规划|制定|安排|去|到)/, '')
    .replace(/\d+\s*[天日](?:游|行程|之旅)?/g, ' ')
    .replace(/(?:的)?(?:旅行|旅游|自由行)?(?:行程|路线|计划|攻略)/g, ' ')
    .replace(/[，,。！!？?\s]+/g, ' ')
    .trim();

  const islandMatch = text.match(/([\u4e00-\u9fa5]{2,8}岛)/);
  if (islandMatch) {
    const island = islandMatch[1];
    return ISLAND_TO_REGION[island] ?? island.replace(/岛$/, '') ?? island;
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

  return aliases.some((alias) => alias.length >= 2 && haystack.includes(alias));
}
