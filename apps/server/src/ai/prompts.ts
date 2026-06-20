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
