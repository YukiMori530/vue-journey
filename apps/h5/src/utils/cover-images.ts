export const FALLBACK_COVER = '/covers/default.jpg'

/** 从攻略封面与目的地中选出可用的静态图（排除 default） */
export function pickGuideStaticCover(
  cover: string | undefined,
  destination: string,
  destinationCovers: Record<string, string> = {},
): string | undefined {
  const city = destination.replace(/(市|县|区|省)$/, '').trim()
  const candidates = mergeCoverCandidates(destinationCovers[city], cover)
  return candidates.find((item) => item !== FALLBACK_COVER)
}

/** 去重合并封面候选，最后兜底 default */
export function mergeCoverCandidates(...sources: (string | undefined)[]): string[] {
  const candidates: string[] = []
  for (const src of sources) {
    if (src && !candidates.includes(src)) {
      candidates.push(src)
    }
  }
  if (!candidates.includes(FALLBACK_COVER)) {
    candidates.push(FALLBACK_COVER)
  }
  return candidates
}
