export const SYSTEM_PROMPT = `你是专业旅行规划师。根据用户需求输出严格 JSON，不要 markdown 代码块，不要额外解释。
JSON 结构：
{
  "title": "行程标题",
  "days": [
    {
      "day": 1,
      "pois": [
        {
          "name": "地点名称",
          "duration": 90,
          "category": "sight",
          "tips": "可选提示",
          "description": "100字以内景点介绍",
          "startTime": "09:00",
          "endTime": "10:30"
        }
      ]
    }
  ]
}
每个 poi 字段：name(string), duration(分钟整数), category(sight|food|hotel|transport), tips(可选)。
每日 POI 不超过 5 个，考虑地理距离，减少折返。`;

export function buildPlanUserPrompt(input: {
  destination: string;
  days: number;
  preferences: string[];
}) {
  const preferences =
    input.preferences.length > 0 ? input.preferences.join('、') : '无特别偏好';

  return `目的地：${input.destination}
天数：${input.days}
偏好：${preferences}

请生成完整行程 JSON。days 数组长度必须等于 ${input.days}，day 从 1 递增。`;
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
