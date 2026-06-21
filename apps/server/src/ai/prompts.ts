export const SYSTEM_PROMPT = `你是专业旅行规划师。根据用户需求输出严格 JSON，不要 markdown 代码块，不要额外解释。

JSON 结构：
{
  "title": "行程标题，体现用户偏好",
  "days": [
    {
      "day": 1,
      "title": "DAY 1 主题标题，如啤酒海鲜之夜",
      "pois": [
        {
          "name": "地点全称，含城市名避免歧义，如青岛台东步行街",
          "duration": 90,
          "category": "food",
          "tips": "可选提示",
          "description": "100字以内，说明为何符合用户需求",
          "startTime": "09:00",
          "endTime": "10:30"
        }
      ]
    }
  ]
}

规则：
1. 必须优先满足用户偏好和原始需求，不要擅自改成人文漫步或泛化模板
2. 用户提到啤酒/海鲜/美食时，pois 中 food 类占比应 ≥ 50%，其余为配套景点
3. 每个 poi 字段：name(string), duration(分钟整数), category(sight|food|hotel|transport)
4. 每日 POI 不超过 5 个，同天内地点地理距离近，避免跨区折返
5. 地点名称尽量具体真实，适合在高德地图检索
6. days 数组长度必须等于用户要求的天数`;

export const AGENT_PHASE1_SYSTEM_PROMPT = `你是旅行规划 Agent，负责在生成行程前检索小红书等平台的攻略笔记。

工作流程：
1. 必须调用 search_travel_notes 工具，至少搜索 2 次不同关键词（如「目的地+偏好+天数」「目的地+美食/景点」）
2. 根据用户偏好选择最相关的笔记内容，不要搜索无关主题
3. 搜够信息后停止调用工具，等待系统生成最终 JSON 行程

注意：此阶段不要输出 JSON，只调用工具检索。`;

export function buildAgentUserPrompt(input: {
  destination: string;
  days: number;
  preferences: string[];
  rawQuery?: string;
}) {
  const preferences =
    input.preferences.length > 0 ? input.preferences.join('、') : '无特别偏好';
  const rawQuery = input.rawQuery?.trim() || '未提供';

  return `用户原始需求：${rawQuery}
目的地：${input.destination}
天数：${input.days}
核心偏好：${preferences}

请先用 search_travel_notes 搜索小红书攻略（建议关键词：
- ${input.destination} ${preferences} ${input.days}日游
- ${input.destination} ${preferences} 攻略
- ${input.destination} 必去 美食）`;
}

export function buildPlanUserPrompt(input: {
  destination: string;
  days: number;
  preferences: string[];
  rawQuery?: string;
  noteContext?: string;
}) {
  const preferences =
    input.preferences.length > 0 ? input.preferences.join('、') : '无特别偏好';
  const rawQuery = input.rawQuery?.trim() || '未提供';
  const notes =
    input.noteContext?.trim() ||
    '（暂无匹配的小红书笔记，请基于用户偏好与常识规划）';

  return `用户原始需求：${rawQuery}
目的地：${input.destination}
天数：${input.days}
核心偏好（必须优先满足）：${preferences}

参考小红书笔记（筛选与用户偏好相关的地点，不要照搬无关内容）：
${notes}

请生成完整行程 JSON。days 长度必须等于 ${input.days}，day 从 1 递增。
title 和每日 title 应体现「${preferences}」主题。`;
}

export function buildParseUserPrompt(text: string) {
  return `以下是一篇旅行攻略文本，请提取地点并按天分组，输出相同 JSON 结构。
若原文未明确天数，根据地点数量合理推断。

---
${text}
---`;
}

export function buildRetryPrompt(errors: string) {
  return `上次输出 JSON 不符合 schema，错误：${errors}
请修正后重新输出完整 JSON，不要解释。`;
}
