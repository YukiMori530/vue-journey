import { parseDayFromMessage } from './pick-revision-focus-day'

export type RevisionScope = 'day' | 'trip'

/** 用户描述早/午/晚餐饮但未指明天数时，需要确认调整范围 */
export function shouldConfirmRevisionScope(
  message: string,
  activeDay: number | null,
  totalDays: number,
): activeDay is number {
  if (activeDay == null || activeDay < 1) {
    return false
  }
  if (parseDayFromMessage(message, totalDays) != null) {
    return false
  }
  return /早上|上午|中午|下午|晚上|夜间|早|午|晚|早餐|午餐|晚餐|想吃|吃点|换成|改为|去掉|删除|新增|加一|洗脚|足浴|按摩|肯德基|麦当劳/i.test(
    message,
  )
}

export function buildRevisionPayload(
  message: string,
  options: {
    focusDay?: number | null
    scope?: RevisionScope
  },
) {
  return {
    message: message.trim(),
    focusDay: options.focusDay ?? undefined,
    scope: options.scope,
  }
}
