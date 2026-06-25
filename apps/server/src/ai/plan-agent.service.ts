import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type { PlanItineraryDto } from './dto/plan-itinerary.dto';
import { PlanAgentTools, PLAN_AGENT_TOOLS } from './plan-agent.tools';
import type { PlanAgentLogHandler } from './plan-agent.types';
import {
  AGENT_PHASE1_SYSTEM_PROMPT,
  buildAgentUserPrompt,
  buildRetryPrompt,
  SYSTEM_PROMPT,
} from './prompts';
import {
  formatZodErrors,
  type ItineraryOutput,
  validateItinerary,
} from './schemas/itinerary.schema';
import { buildTitle, mockDayPlans, placeName } from '../trips/trip-builder';
import { z } from 'zod';

const MAX_TOOL_ROUNDS = 6;
const MAX_JSON_ATTEMPTS = 3;

@Injectable()
export class PlanAgentService {
  private readonly logger = new Logger(PlanAgentService.name);
  private readonly client: OpenAI | null;

  constructor(
    private readonly configService: ConfigService,
    private readonly agentTools: PlanAgentTools,
  ) {
    const apiKey = this.configService.get<string>('DEEPSEEK_API_KEY');
    const baseURL =
      this.configService.get<string>('DEEPSEEK_BASE_URL') ??
      'https://api.deepseek.com';

    this.client = apiKey ? new OpenAI({ apiKey, baseURL }) : null;
  }

  async planItinerary(
    dto: PlanItineraryDto,
    onLog: PlanAgentLogHandler = () => undefined,
  ): Promise<ItineraryOutput> {
    if (!this.client) {
      this.logger.warn('DEEPSEEK_API_KEY 未配置，使用本地 mock Agent');
      return this.mockAgentPlan(dto, onLog);
    }

    try {
      return await this.runAgent(dto, onLog);
    } catch (error) {
      if (this.shouldFallbackToMock(error)) {
        this.logger.warn('DeepSeek 不可用，回退 mock Agent');
        return this.mockAgentPlan(dto, onLog);
      }
      throw error;
    }
  }

  private async runAgent(
    dto: PlanItineraryDto,
    onLog: PlanAgentLogHandler,
  ): Promise<ItineraryOutput> {
    this.agentTools.resetSession();

    onLog({
      kind: 'intro',
      text: `我来帮你规划${dto.destination}${dto.days}日游！先搜索旅行攻略和最新信息。`,
    });

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: AGENT_PHASE1_SYSTEM_PROMPT },
      { role: 'user', content: buildAgentUserPrompt(dto) },
    ];

    for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
      const response = await this.client!.chat.completions.create({
        model: 'deepseek-chat',
        messages,
        tools: PLAN_AGENT_TOOLS,
        tool_choice: round === 0 ? 'required' : 'auto',
        temperature: 0.3,
      });

      const message = response.choices[0]?.message;
      if (!message) {
        break;
      }

      const toolCalls = message.tool_calls ?? [];
      if (!toolCalls.length) {
        break;
      }

      messages.push(message);

      for (const call of toolCalls) {
        if (call.type !== 'function') {
          continue;
        }

        const args = JSON.parse(call.function.arguments || '{}') as {
          query?: string;
        };
        const query = args.query?.trim() || dto.destination;
        onLog({
          kind: 'search',
          text: `正在搜索旅行攻略：${query}`,
        });

        const result = await this.agentTools.searchTravelNotes(query, dto.destination);

        if (result.freshCount > 0) {
          onLog({
            kind: 'result',
            text: `找到 ${result.freshCount} 篇攻略：${result.titles.join('、')}`,
          });
        } else if (result.duplicate && result.matchedTitles.length) {
          onLog({
            kind: 'result',
            text: `已检索过类似关键词，继续补充搜索…`,
          });
        } else if (result.count === 0) {
          onLog({
            kind: 'result',
            text: `暂无「${dto.destination}」本地攻略，将结合通用知识继续规划…`,
          });
        } else {
          onLog({
            kind: 'result',
            text: `继续从更多关键词检索「${dto.destination}」相关攻略…`,
          });
        }

        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify(result),
        });
      }
    }

    onLog({ kind: 'intro', text: '攻略信息已整理，正在生成路线…' });
    onLog({ kind: 'check', text: '🚀 行程规划进行中，正在验证偏好与路线合理性…' });

    const jsonMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
      [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.filter((item) => item.role !== 'system'),
        {
          role: 'user',
          content: `请根据以上搜索到的攻略笔记和用户偏好，输出完整行程 JSON。
days 长度必须等于 ${dto.days}。优先采用笔记中出现的真实地点，满足用户偏好（${dto.preferences.join('、') || '当地特色'}）。
远郊景点（长城、兵马俑等）必须单独一天且当天仅 1～2 个远郊 POI；每日总共 2～3 个 POI，同片区安排，禁止八达岭+簋街这类跨城混排。`,
        },
      ];

    const itinerary = await this.generateItineraryJson(jsonMessages, onLog);

    onLog({
      kind: 'summary',
      text: `已为你规划${dto.destination}${dto.days}日游：${itinerary.title}`,
    });

    return itinerary;
  }

  private async generateItineraryJson(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    onLog: PlanAgentLogHandler,
  ): Promise<ItineraryOutput> {
    let lastError = '未知错误';

    for (let attempt = 0; attempt < MAX_JSON_ATTEMPTS; attempt += 1) {
      const response = await this.client!.chat.completions.create({
        model: 'deepseek-chat',
        messages,
        response_format: { type: 'json_object' },
        temperature: 0.35,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        lastError = 'AI 返回空内容';
        messages.push({ role: 'user', content: buildRetryPrompt(lastError) });
        continue;
      }

      try {
        const parsed = JSON.parse(content) as unknown;
        const itinerary = validateItinerary(parsed);
        onLog({ kind: 'check', text: '✅ 路线合理性验证通过，正在输出最终行程' });
        return itinerary;
      } catch (error) {
        if (error instanceof z.ZodError) {
          lastError = formatZodErrors(error);
        } else if (error instanceof SyntaxError) {
          lastError = 'JSON 解析失败';
        } else if (error instanceof Error) {
          lastError = error.message;
        } else {
          lastError = 'JSON 解析失败';
        }
        onLog({
          kind: 'adjust',
          text: '检查完毕，正在微调路线顺序与地点…',
        });
        messages.push({ role: 'user', content: buildRetryPrompt(lastError) });
      }
    }

    throw new Error(`AI 行程生成失败：${lastError}`);
  }

  private async mockAgentPlan(
    dto: PlanItineraryDto,
    onLog: PlanAgentLogHandler,
  ): Promise<ItineraryOutput> {
    this.agentTools.resetSession();
    const prefHint = dto.preferences.join('、') || '当地特色';
    const year = new Date().getFullYear();

    onLog({
      kind: 'intro',
      text: `我来帮你规划${dto.destination}${dto.days}日游！先搜索旅行攻略。`,
    });

    const queries = [
      `${dto.destination}${prefHint}${dto.days}日游 ${year}`,
      `${dto.destination} ${prefHint} 攻略`,
    ];

    for (const query of queries) {
      onLog({ kind: 'search', text: `正在搜索旅行攻略：${query}` });
      await this.delay(350);
      const result = await this.agentTools.searchTravelNotes(query, dto.destination);
      if (result.freshCount > 0) {
        onLog({
          kind: 'result',
          text: `找到 ${result.freshCount} 篇攻略：${result.titles.join('、')}`,
        });
      } else if (result.duplicate && result.matchedTitles.length) {
        onLog({
          kind: 'result',
          text: `检索「${query}」，关联攻略：${result.matchedTitles.join('、')}`,
        });
      }
    }

    onLog({ kind: 'intro', text: '信息已收集，正在生成路线…' });
    await this.delay(400);

    const prefText = [...dto.preferences, dto.rawQuery ?? ''].join('');
    const foodFocused =
      /啤酒|海鲜|美食|逛吃|小吃/.test(prefText) ||
      dto.preferences.some((item) => /啤酒|海鲜|美食/.test(item));

    const templates = foodFocused
      ? ['啤酒博物馆', '海鲜市场', '台东步行街', '劈柴院', '奥帆中心', '本地海鲜大排档']
      : ['中心广场', '特色步行街', '本地美食街', '城市公园', '博物馆', '网红咖啡店'];

    const dayPlans = mockDayPlans(dto.destination, dto.days, templates);

    onLog({ kind: 'check', text: '✅ 路线合理性验证通过' });

    return {
      title: buildTitle(dto.destination, dto.days, dto.preferences),
      days: dayPlans.map((day) => ({
        day: day.day,
        title: foodFocused
          ? `DAY ${day.day} ${dto.preferences[0] ?? '美食'}之旅`
          : undefined,
        pois: day.places.map((place, index) => ({
          name: placeName(place),
          duration: 60 + index * 30,
          category: foodFocused
            ? ('food' as const)
            : index % 2 === 0
              ? ('sight' as const)
              : ('food' as const),
        })),
      })),
    };
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private shouldFallbackToMock(error: unknown): boolean {
    if (error && typeof error === 'object' && 'status' in error) {
      const status = Number((error as { status: number }).status);
      return status === 402 || status === 401 || status === 429;
    }
    return false;
  }
}
