import type { Trip } from '../types/trip'
import { mergeCoverCandidates } from './cover-images'

/** 按目的地匹配本地封面（不依赖外网 Unsplash） */
export const DESTINATION_COVERS: Record<string, string> = {
  成都: '/covers/chengdu.jpg',
  海南: '/covers/hainan.jpg',
  烟台: '/covers/yantai.jpg',
  北京: '/covers/beijing.jpg',
  上海: '/covers/shanghai.jpg',
}

/** 封面加载候选列表：本地优先，再试数据库里的 URL，最后 default */
export function getTripCoverCandidates(trip: Trip): string[] {
  const local = DESTINATION_COVERS[trip.destination]
  return mergeCoverCandidates(local, trip.cover)
}
