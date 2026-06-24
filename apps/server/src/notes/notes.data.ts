export type { TravelGuideSeed } from './guides.seed-data';
export { travelGuideSeeds } from './guides.seed-data';

/** @deprecated 使用 travelGuideSeeds / 数据库 TravelGuide 表 */
export interface XhsNote {
  id: string
  title: string
  author: string
  cover: string
  destination: string
  days: number
  likes: string
  snippet: string
  content: string
  keywords: string[]
  category?: string
}
