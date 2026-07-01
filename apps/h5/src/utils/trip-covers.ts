import type { Trip } from '../types/trip'
import { DESTINATION_COVERS } from '../data/destination-covers'
import { mergeCoverCandidates } from './cover-images'

export { DESTINATION_COVERS } from '../data/destination-covers'

/** 封面加载候选列表：本地优先，再试数据库里的 URL，最后 default */
export function getTripCoverCandidates(trip: Trip): string[] {
  const local = DESTINATION_COVERS[trip.destination]
  return mergeCoverCandidates(local, trip.cover)
}
