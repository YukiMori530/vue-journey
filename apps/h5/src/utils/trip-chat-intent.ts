const REVISION_KEYWORDS =
  /改|换|加|删|少|多|调整|优化|规划|行程|路线|景点|美食|轻松|紧|第\s*\d+\s*天|DAY\s*\d+|站点|一站|替换|去掉|增加|安排|混排|单独/i

const CHITCHAT_PATTERNS =
  /^(你是谁|你是什么|你能做什么|你好|您好|hi|hello|谢谢|感谢|在吗|干啥|干嘛|怎么样)[？?！!。.\s]*$/i

/** 判断用户是否在请求修改行程（而非闲聊） */
export function isTripRevisionIntent(message: string): boolean {
  const text = message.trim()
  if (!text) {
    return false
  }
  if (CHITCHAT_PATTERNS.test(text)) {
    return false
  }
  if (REVISION_KEYWORDS.test(text)) {
    return true
  }
  // 带具体地点/天数的长句更可能是改行程
  if (text.length >= 12 && /天|站|去|玩|逛|看/.test(text)) {
    return true
  }
  return false
}
