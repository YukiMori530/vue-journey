export const FALLBACK_COVER = '/covers/default.jpg'

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
