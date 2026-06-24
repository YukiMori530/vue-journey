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
}
