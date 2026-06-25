/** 从攻略正文提取首个 POI，供探索页封面图使用 */
export function extractGuideCoverPlace(content: string, destination: string): string {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  for (const line of lines) {
    if (/^第\s*[0-9一二三四五六七八九十]+\s*天/.test(line)) {
      continue
    }
    const place = line.replace(/^[\s\-·•*\d+.、)）]+/, '').trim()
    if (place.length >= 2 && !/^第/.test(place)) {
      return place
    }
  }

  return destination.replace(/(市|县|区|省)$/, '') || destination
}
