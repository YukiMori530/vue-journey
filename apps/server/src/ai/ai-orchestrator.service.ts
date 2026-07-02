import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  buildParseUserPrompt,
  buildPlanUserPrompt,
  buildRetryPrompt,
  buildReviseUserPrompt,
  REVISE_SYSTEM_PROMPT,
  SYSTEM_PROMPT,
  TRIP_CHAT_SYSTEM_PROMPT,
  ASSISTANT_SYSTEM_PROMPT,
  buildTripChatUserPrompt,
  buildAssistantUserPrompt,
} from './prompts';
import {
  formatZodErrors,
  type ItineraryOutput,
  validateItinerary,
} from './schemas/itinerary.schema';
import {
  buildTitle,
  mockDayPlans,
  placeName,
} from '../trips/trip-builder';
import { parseGuideText } from '../trips/parse-guide';
import type { PlanItineraryDto } from './dto/plan-itinerary.dto';
import type { TripResponse } from '../trips/trip.types';
import {
  applyDeterministicRevision,
  tripToItinerarySnapshot,
} from './itinerary-revision.utils';
import { z } from 'zod';

const MAX_ATTEMPTS = 3;

@Injectable()
export class AiOrchestratorService {
  private readonly logger = new Logger(AiOrchestratorService.name);
  private readonly client: OpenAI | null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('DEEPSEEK_API_KEY');
    const baseURL =
      this.configService.get<string>('DEEPSEEK_BASE_URL') ??
      'https://api.deepseek.com';

    this.client = apiKey
      ? new OpenAI({ apiKey, baseURL })
      : null;
  }

  async planItinerary(
    dto: PlanItineraryDto,
    noteContext?: string,
  ): Promise<ItineraryOutput> {
    if (!this.client) {
      this.logger.warn('DEEPSEEK_API_KEY 未配置，使用本地 mock 行程');
      return this.mockItinerary(dto);
    }

    try {
      return await this.generateItinerary([
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: buildPlanUserPrompt({ ...dto, noteContext }),
        },
      ]);
    } catch (error) {
      if (this.shouldFallbackToMock(error)) {
        this.logger.warn(`DeepSeek 不可用（${this.describeAiError(error)}），回退 mock 行程`);
        return this.mockItinerary(dto);
      }
      throw error;
    }
  }

  async parseGuideText(text: string): Promise<ItineraryOutput> {
    if (!this.client) {
      this.logger.warn('DEEPSEEK_API_KEY 未配置，使用本地规则解析');
      return this.mockParseItinerary(text);
    }

    try {
      return await this.generateItinerary([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildParseUserPrompt(text) },
      ]);
    } catch (error) {
      if (this.shouldFallbackToMock(error)) {
        this.logger.warn(`DeepSeek 不可用（${this.describeAiError(error)}），回退 mock 解析`);
        return this.mockParseItinerary(text);
      }
      throw error;
    }
  }

  async reviseItinerary(
    trip: TripResponse,
    message: string,
    options?: { focusDay?: number; scope?: 'day' | 'trip' },
  ): Promise<ItineraryOutput> {
    const dayPlans = trip.dayPlans.map((day) => ({
      day: day.day,
      title: day.title,
      places: day.places.map((place) => ({
        name: typeof place === 'string' ? place : place.name,
        category: typeof place === 'string' ? undefined : place.category,
      })),
    }));

    if (!this.client) {
      this.logger.warn('DEEPSEEK_API_KEY 未配置，使用本地 mock 修订');
      return this.mockReviseItinerary(trip, message, dayPlans);
    }

    try {
      return await this.generateItinerary(
        [
          { role: 'system', content: REVISE_SYSTEM_PROMPT },
          {
            role: 'user',
            content: buildReviseUserPrompt({
              destination: trip.destination,
              days: trip.days,
              preferences: trip.preferences,
              title: trip.title,
              dayPlans,
              message,
              focusDay: options?.focusDay,
              scope: options?.scope,
            }),
          },
        ],
        trip.days,
      );
    } catch (error) {
      if (this.shouldFallbackToMock(error)) {
        this.logger.warn(`DeepSeek 不可用（${this.describeAiError(error)}），回退 mock 修订`);
        return this.mockReviseItinerary(trip, message, dayPlans);
      }
      throw error;
    }
  }

  async chatWithTrip(trip: TripResponse, message: string): Promise<string> {
    const dayPlans = trip.dayPlans.map((day) => ({
      day: day.day,
      title: day.title,
      places: day.places.map((place) => ({
        name: typeof place === 'string' ? place : place.name,
      })),
    }));

    if (!this.client) {
      return this.mockTripChat(message, trip);
    }

    try {
      const response = await this.client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: TRIP_CHAT_SYSTEM_PROMPT },
          {
            role: 'user',
            content: buildTripChatUserPrompt({
              destination: trip.destination,
              title: trip.title,
              days: trip.days,
              dayPlans,
              message,
            }),
          },
        ],
        temperature: 0.65,
      });
      const text = response.choices[0]?.message?.content?.trim();
      return text || this.mockTripChat(message, trip);
    } catch (error) {
      if (this.shouldFallbackToMock(error)) {
        this.logger.warn(`DeepSeek 不可用（${this.describeAiError(error)}），回退 mock 对话`);
        return this.mockTripChat(message, trip);
      }
      throw error;
    }
  }

  async chatAssistant(
    message: string,
    context?: { page?: string; hint?: string },
  ): Promise<string> {
    if (!this.client) {
      return this.mockAssistantChat(message, context?.hint);
    }

    try {
      const response = await this.client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: ASSISTANT_SYSTEM_PROMPT },
          {
            role: 'user',
            content: buildAssistantUserPrompt({
              message,
              page: context?.page,
              hint: context?.hint,
            }),
          },
        ],
        temperature: 0.7,
      });
      const text = response.choices[0]?.message?.content?.trim();
      return text || this.mockAssistantChat(message, context?.hint);
    } catch (error) {
      if (this.shouldFallbackToMock(error)) {
        return this.mockAssistantChat(message, context?.hint);
      }
      throw error;
    }
  }

  private async generateItinerary(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    expectedDays?: number,
  ): Promise<ItineraryOutput> {
    let lastError = '未知错误';

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const response = await this.client!.chat.completions.create({
        model: 'deepseek-chat',
        messages,
        response_format: { type: 'json_object' },
        temperature: 0.35,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        lastError = 'AI 返回空内容';
        messages.push({
          role: 'user',
          content: buildRetryPrompt(lastError),
        });
        continue;
      }

      try {
        const parsed = JSON.parse(content) as unknown;
        const itinerary = validateItinerary(parsed);
        if (expectedDays != null && itinerary.days.length !== expectedDays) {
          lastError = `days 长度应为 ${expectedDays}，实际为 ${itinerary.days.length}`;
          messages.push({
            role: 'user',
            content: buildRetryPrompt(lastError),
          });
          continue;
        }
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
        messages.push({
          role: 'user',
          content: buildRetryPrompt(lastError),
        });
      }
    }

    throw new Error(`AI 行程生成失败：${lastError}`);
  }

  private shouldFallbackToMock(error: unknown): boolean {
    if (error && typeof error === 'object' && 'status' in error) {
      const status = Number((error as { status: number }).status);
      return status === 402 || status === 401 || status === 429;
    }
    return false;
  }

  private describeAiError(error: unknown): string {
    if (error && typeof error === 'object') {
      const apiError = error as { status?: number; message?: string; error?: { message?: string } };
      if (apiError.status === 402) {
        return '账户余额不足，请前往 DeepSeek 控制台充值';
      }
      return apiError.error?.message ?? apiError.message ?? 'API 调用失败';
    }
    return '未知错误';
  }

  private mockItinerary(dto: PlanItineraryDto): ItineraryOutput {
    const prefText = [...dto.preferences, dto.rawQuery ?? ''].join('');
    const foodFocused =
      /啤酒|海鲜|美食|逛吃|小吃/.test(prefText) ||
      dto.preferences.some((item) => /啤酒|海鲜|美食/.test(item));

    const templates = foodFocused
      ? ['啤酒博物馆', '海鲜市场', '台东步行街', '劈柴院', '奥帆中心酒吧街', '本地海鲜大排档']
      : ['中心广场', '特色步行街', '本地美食街', '城市公园', '博物馆', '网红咖啡店'];

    const dayPlans = mockDayPlans(dto.destination, dto.days, templates);

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
          category: foodFocused ? ('food' as const) : index % 2 === 0 ? ('sight' as const) : ('food' as const),
        })),
      })),
    };
  }

  private mockParseItinerary(text: string): ItineraryOutput {
    const parsed = parseGuideText(text);

    return {
      title: `${parsed.destination}${parsed.days}日导入行程`,
      days: parsed.dayPlans.map((day) => ({
        day: day.day,
        pois: day.places.map((place, index) => ({
          name: placeName(place),
          duration: 60 + index * 20,
          category: 'sight' as const,
        })),
      })),
    };
  }

  private mockReviseItinerary(
    trip: TripResponse,
    message: string,
    dayPlans: Array<{
      day: number;
      title?: string;
      places: Array<{ name: string; category?: string }>;
    }>,
  ): ItineraryOutput {
    const snapshot = tripToItinerarySnapshot({
      title: trip.title,
      days: dayPlans,
    });
    return applyDeterministicRevision(snapshot, message, trip.destination);
  }

  private mockTripChat(message: string, trip: TripResponse): string {
    const text = message.trim();
    if (/你是谁|你是什么|介绍一下/.test(text)) {
      return '我是途绘 AI 助手，可以回答旅行相关问题，也可以帮你调整当前行程。想改行程时，直接说比如「第三天轻松一点」或「长城单独一天」即可。';
    }
    if (/你好|您好|hi|hello/i.test(text)) {
      return `你好！我看到你正在看「${trip.title}」。有什么想聊的，或想调整行程的地方，都可以告诉我。`;
    }
    if (/谢谢|感谢/.test(text)) {
      return '不客气！有需要随时叫我。';
    }
    return `关于「${trip.title}」，我可以帮你解答问题或调整行程。若需要改路线，请具体说想改哪一天、哪些地点。`;
  }

  private mockAssistantChat(message: string, hint?: string): string {
    const text = message.trim();
    if (/你是谁|你是什么|介绍一下/.test(text)) {
      return '我是途绘小助手，可以聊旅行、推荐城市景点，也能引导你创建 AI 行程。想规划的话可以说「帮我规划海南三日游」。';
    }
    if (/规划|几日游|行程/.test(text)) {
      return '想生成完整行程，可以点底部「+」创建，或直接说「帮我规划XX几日游」。我会检索攻略并自动生成路线。';
    }
    if (/海南|三亚|海口/.test(text)) {
      return '海南推荐三亚看海（蜈支洲、亚龙湾、后海村）+ 海口骑楼老街。可以说「帮我规划海南三日游」一键生成。';
    }
    if (hint) {
      return `我看到你在看：${hint}。可以告诉我你想补哪些景点，或说「帮我规划XX几日游」重新生成。`;
    }
    return '有什么旅行问题都可以问我。想规划行程，直接说目的地和天数就行。';
  }
}
